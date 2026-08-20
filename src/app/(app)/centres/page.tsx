import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import FormulaireCentre from "@/components/formulaire-centre";
import { inclusionsParCentre, listerCentres } from "@/lib/clinique";
import { listerEtudes } from "@/lib/requetes";
import { NIVEAUX_RISQUE, STATUTS_CENTRE } from "@/lib/constantes";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageCentres({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string }>;
}) {
  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : undefined;
  const [lignes, etudes, inclusions] = await Promise.all([
    listerCentres({ etudeId }),
    listerEtudes(),
    inclusionsParCentre(etudeId),
  ]);
  const parCentre = new Map(inclusions.map((i) => [i.centreId, i]));

  return (
    <div className="space-y-5">
      <EntetePage
        titre="Centres"
        description="Centres investigateurs, inclusions et niveau de risque."
        actions={<FormulaireCentre etudes={etudes} />}
      />
      {lignes.length === 0 ? (
        <div className="space-y-4">
          <EtatVide
            titre="Aucun centre n'est associé à cette étude."
            texte="Ajoutez un centre pour suivre les inclusions, le monitoring et le risque. Le bouton ci-dessus ouvre le formulaire."
          />
        </div>
      ) : (
        <Tableau
          colonnes={["N°", "Centre", "Étude", "Statut", "Risque", "Inclusions", "Objectif"]}
        >
          {lignes.map((l) => {
            const inc = parCentre.get(l.centre.id);
            const inclus = Number(inc?.inclus ?? 0);
            const obj = l.centre.objectifInclusion;
            return (
              <tr key={l.centre.id}>
                <td className="font-semibold">{l.centre.numero}</td>
                <td>
                  <Link href={`/centres/${l.centre.id}`} className="font-medium hover:text-accent">
                    {l.centre.nom}
                  </Link>
                  <p className="text-xs text-attenue">{l.centre.investigateurPrincipal}</p>
                </td>
                <td>{l.etudeCode}</td>
                <td>{STATUTS_CENTRE[l.centre.statut] ?? l.centre.statut}</td>
                <td>{NIVEAUX_RISQUE[l.centre.risque] ?? l.centre.risque}</td>
                <td className="chiffres">{inclus}</td>
                <td className="chiffres">
                  {obj != null ? `${inclus} / ${obj}` : "—"}
                </td>
              </tr>
            );
          })}
        </Tableau>
      )}
    </div>
  );
}
