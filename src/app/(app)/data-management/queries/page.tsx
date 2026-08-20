import Link from "next/link";
import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import FormulaireQuery from "@/components/formulaire-query";
import { listerCentres, listerQueries, listerSujets } from "@/lib/clinique";
import { listerEtudes } from "@/lib/requetes";
import { LIBELLES_STATUT_QUERY } from "@/lib/queries-workflow";
import { formaterDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PageQueries({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; etude?: string }>;
}) {
  const params = await searchParams;
  const [lignes, etudes, centres, sujets] = await Promise.all([
    listerQueries({
      statut: params.statut,
      q: params.q,
      etudeId: params.etude ? Number(params.etude) : undefined,
    }),
    listerEtudes(),
    listerCentres(),
    listerSujets(),
  ]);

  return (
    <div className="space-y-5">
      <EntetePage
        titre="Queries"
        description="Cycle Open → Answered → Reopened → Resolved → Closed, avec historique."
        actions={
          <FormulaireQuery
            etudes={etudes}
            centres={centres.map((c) => c.centre)}
            sujets={sujets.map((s) => s.sujet)}
          />
        }
      />
      <form method="get" className="sans-impression flex flex-wrap gap-2">
        <input name="q" defaultValue={params.q ?? ""} placeholder="QUERY-… ou texte" className="champ max-w-xs" />
        <select name="statut" defaultValue={params.statut ?? ""} className="champ max-w-[12rem]">
          <option value="">Tous les statuts</option>
          {Object.entries(LIBELLES_STATUT_QUERY).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button className="bouton-discret">Filtrer</button>
      </form>
      {lignes.length === 0 ? (
        <EtatVide
          titre="Aucune query."
          texte="Créez une query depuis une visite, un formulaire ou ce module. Elle apparaîtra ici, sur le sujet, le centre et le tableau de bord du Data Manager."
        />
      ) : (
        <Tableau colonnes={["ID", "Étude", "Sujet", "Type", "Statut", "Créée"]}>
          {lignes.map((l) => (
            <tr key={l.query.id}>
              <td>
                <Link href={`/data-management/queries/${l.query.id}`} className="font-semibold hover:text-accent">
                  {l.query.code}
                </Link>
              </td>
              <td>{l.etudeCode}</td>
              <td>{l.subjectId ?? "—"}</td>
              <td>{l.query.type}</td>
              <td>{LIBELLES_STATUT_QUERY[l.query.statut as keyof typeof LIBELLES_STATUT_QUERY] ?? l.query.statut}</td>
              <td className="chiffres">{formaterDate(l.query.creeLe)}</td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
