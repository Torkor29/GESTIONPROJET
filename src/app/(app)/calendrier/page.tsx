import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import { listerVisitesSujet } from "@/lib/clinique";
import { listerEtudes } from "@/lib/requetes";
import { STATUTS_VISITE_SUJET } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import Link from "next/link";
import { SelecteurStatutVisiteSujet } from "@/components/selecteur-statut-clinique";

export const dynamic = "force-dynamic";

export default async function PageCalendrierVisites({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; statut?: string }>;
}) {
  const params = await searchParams;
  const maintenant = Math.floor(Date.now() / 1000);
  const [lignes, etudes] = await Promise.all([
    listerVisitesSujet({
      etudeId: params.etude ? Number(params.etude) : undefined,
      statut: params.statut,
    }),
    listerEtudes(),
  ]);

  const avecRetard = lignes.map((l) => {
    const enRetard =
      Boolean(l.visite.datePrevue) &&
      l.visite.datePrevue! < maintenant &&
      l.visite.statut !== "realisee" &&
      l.visite.statut !== "annulee";
    return { ...l, enRetard };
  });

  return (
    <div className="space-y-5">
      <EntetePage
        titre="Visites sujets"
        description="Calendrier des visites protocolaires. Les retards sont signalés."
      />
      <form method="get" className="sans-impression carte flex flex-wrap gap-3 p-4">
        <select name="etude" defaultValue={params.etude ?? ""} className="champ max-w-xs">
          <option value="">Toutes les études</option>
          {etudes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.code ?? e.nom}
            </option>
          ))}
        </select>
        <select name="statut" defaultValue={params.statut ?? ""} className="champ max-w-xs">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_VISITE_SUJET).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button className="bouton-discret" type="submit">
          Filtrer
        </button>
      </form>
      {avecRetard.length === 0 ? (
        <EtatVide
          titre="Aucune visite n'est encore planifiée."
          texte="D'abord le calendrier protocolaire de l'étude (onglet Visites), ensuite l'inclusion d'un Subject ID."
          action={{ href: "/etudes", libelle: "Ouvrir les études" }}
        />
      ) : (
        <Tableau colonnes={["Date prévue", "Sujet", "Visite", "Étude", "Centre", "Statut"]}>
          {avecRetard.map((l) => (
            <tr key={l.visite.id} className={l.enRetard ? "bg-alerte-voile/40" : ""}>
              <td className="chiffres">{formaterDate(l.visite.datePrevue)}</td>
              <td>
                <Link href={`/sujets/${l.visite.sujetId}`} className="hover:text-accent">
                  {l.subjectId}
                </Link>
              </td>
              <td>{l.visite.nom}</td>
              <td>{l.etudeCode}</td>
              <td>{l.centreNumero ?? "—"}</td>
              <td>
                {l.enRetard ? (
                  <span className="mr-2 text-xs font-semibold text-alerte">En retard</span>
                ) : null}
                <SelecteurStatutVisiteSujet id={l.visite.id} statut={l.visite.statut} />
              </td>
            </tr>
          ))}
        </Tableau>
      )}
    </div>
  );
}
