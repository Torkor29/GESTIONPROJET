import { notFound } from "next/navigation";
import { historiqueQuery, queryParId } from "@/lib/clinique";
import { EntetePage } from "@/components/ui";
import ActionsQuery from "@/components/actions-query";
import { LIBELLES_STATUT_QUERY } from "@/lib/queries-workflow";
import { formaterDateHeure } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageQuery({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ligne = await queryParId(Number(id));
  if (!ligne) notFound();
  const hist = await historiqueQuery(ligne.query.id);

  return (
    <div className="space-y-6">
      <EntetePage
        surtitre={ligne.etude.code ?? ligne.etude.nom}
        titre={ligne.query.code}
        description={LIBELLES_STATUT_QUERY[ligne.query.statut as keyof typeof LIBELLES_STATUT_QUERY]}
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="carte space-y-4 p-5">
          <p className="text-sm leading-relaxed">{ligne.query.description}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-efface">Sujet</dt>
              <dd>
                {ligne.sujet ? (
                  <Link href={`/sujets/${ligne.sujet.id}`} className="text-accent">
                    {ligne.sujet.subjectId}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-efface">Centre</dt>
              <dd>
                {ligne.centre ? (
                  <Link href={`/centres/${ligne.centre.id}`}>{ligne.centre.numero}</Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-efface">Type</dt>
              <dd>{ligne.query.type}</dd>
            </div>
            {ligne.query.reponse && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-efface">Réponse</dt>
                <dd>{ligne.query.reponse}</dd>
              </div>
            )}
          </dl>
          <ActionsQuery id={ligne.query.id} statut={ligne.query.statut} />
        </section>
        <section className="carte p-5">
          <h2 className="font-titre text-sm font-bold">Historique</h2>
          <p className="mb-3 text-xs text-efface">Non modifiable.</p>
          <ol className="space-y-3 text-sm">
            {hist.map((h) => (
              <li key={h.evenement.id} className="border-l-2 border-accent/40 pl-3">
                <p className="font-medium">
                  {h.auteurNom ?? "Système"} — {formaterDateHeure(h.evenement.creeLe)}
                </p>
                <p className="text-attenue">
                  {h.evenement.ancienStatut ?? "—"} → {h.evenement.nouveauStatut}
                </p>
                {h.evenement.commentaire && (
                  <p className="mt-1 text-xs">{h.evenement.commentaire}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
