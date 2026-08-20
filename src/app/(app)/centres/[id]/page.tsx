import { notFound } from "next/navigation";
import { centreParId, listerSujets } from "@/lib/clinique";
import { listerEtudes } from "@/lib/requetes";
import FormulaireCentre from "@/components/formulaire-centre";
import { EntetePage, EtatVide, Tableau } from "@/components/ui";
import { NIVEAUX_RISQUE, STATUTS_CENTRE } from "@/lib/constantes";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageCentre({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const centre = await centreParId(Number(id));
  if (!centre) notFound();
  const [sujets, etudes] = await Promise.all([
    listerSujets({ centreId: centre.id }),
    listerEtudes(),
  ]);

  return (
    <div className="space-y-6">
      <EntetePage
        surtitre={`Centre ${centre.numero}`}
        titre={centre.nom}
        description={centre.etablissement ?? undefined}
        actions={<FormulaireCentre etudes={etudes} centre={centre} libelle="Modifier" />}
      />
      <dl className="carte grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <dt className="sur-titre">Statut</dt>
          <dd className="mt-1">{STATUTS_CENTRE[centre.statut]}</dd>
        </div>
        <div>
          <dt className="sur-titre">Risque</dt>
          <dd className="mt-1">{NIVEAUX_RISQUE[centre.risque]}</dd>
        </div>
        <div>
          <dt className="sur-titre">Investigateur</dt>
          <dd className="mt-1">{centre.investigateurPrincipal ?? "—"}</dd>
        </div>
        <div>
          <dt className="sur-titre">Objectif</dt>
          <dd className="mt-1 chiffres">{centre.objectifInclusion ?? "—"}</dd>
        </div>
        <div>
          <dt className="sur-titre">Contact</dt>
          <dd className="mt-1 text-sm">{centre.email ?? "—"}</dd>
        </div>
      </dl>
      <section>
        <h2 className="mb-3 font-titre text-lg font-bold">Sujets</h2>
        {sujets.length === 0 ? (
          <EtatVide
            titre="Aucun sujet dans ce centre."
            texte="Les inclusions apparaîtront ici dès qu'un Subject ID sera créé."
            action={{ href: "/sujets", libelle: "Ajouter un sujet" }}
          />
        ) : (
          <Tableau colonnes={["Subject ID", "Statut", "Inclusion"]}>
            {sujets.map((s) => (
              <tr key={s.sujet.id}>
                <td>
                  <Link href={`/sujets/${s.sujet.id}`} className="font-medium hover:text-accent">
                    {s.sujet.subjectId}
                  </Link>
                </td>
                <td>{s.sujet.statut}</td>
                <td>{s.sujet.dateInclusion ? new Date(s.sujet.dateInclusion * 1000).toLocaleDateString("fr-FR") : "—"}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </section>
    </div>
  );
}
