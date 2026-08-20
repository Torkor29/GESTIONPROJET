import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import FormulaireSujet from "@/components/formulaire-sujet";
import { listerCentres, listerSujets } from "@/lib/clinique";
import { listerEtudes } from "@/lib/requetes";
import { STATUTS_SUJET } from "@/lib/constantes";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageSujets({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [lignes, etudes, centres] = await Promise.all([
    listerSujets({
      etudeId: params.etude ? Number(params.etude) : undefined,
      q: params.q,
    }),
    listerEtudes(),
    listerCentres(),
  ]);

  return (
    <div className="space-y-5">
      <EntetePage
        titre="Sujets"
        description="Identifiants d'étude uniquement — pas de données nominatives."
        actions={
          <FormulaireSujet etudes={etudes} centres={centres.map((c) => c.centre)} />
        }
      />
      <form method="get" className="sans-impression flex flex-wrap gap-2">
        <input name="q" defaultValue={params.q ?? ""} placeholder="SUBJ-…" className="champ max-w-xs" />
        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
      </form>
      {lignes.length === 0 ? (
        <EtatVide
          titre="Aucun sujet n'est encore inclus."
          texte="Créez un Subject ID rattaché à un centre. Le calendrier de visites se génère à partir des visites définies dans l'étude."
          action={{ href: "/sujets", libelle: "Ajouter un sujet" }}
        />
      ) : (
        <Tableau colonnes={["Subject ID", "Étude", "Centre", "Statut", "Bras", "Données"]}>
          {lignes.map((l) => (
            <tr key={l.sujet.id}>
              <td>
                <Link href={`/sujets/${l.sujet.id}`} className="font-semibold hover:text-accent">
                  {l.sujet.subjectId}
                </Link>
              </td>
              <td>{l.etudeCode}</td>
              <td>
                {l.centreNumero ? `${l.centreNumero} — ${l.centreNom}` : "—"}
              </td>
              <td>{STATUTS_SUJET[l.sujet.statut] ?? l.sujet.statut}</td>
              <td>{l.sujet.bras ?? "—"}</td>
              <td>{l.sujet.statutDonnees}</td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
