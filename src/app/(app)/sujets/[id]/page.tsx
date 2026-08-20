import { notFound } from "next/navigation";
import { listerQueries, visitesDuSujet, sujetParId } from "@/lib/clinique";
import { EntetePage, EtatVide } from "@/components/ui";
import { STATUTS_SUJET, STATUTS_VISITE_SUJET } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PageSujet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ligne = await sujetParId(Number(id));
  if (!ligne) notFound();
  const { sujet, etude, centre } = ligne;
  const [visites, queries] = await Promise.all([
    visitesDuSujet(sujet.id),
    listerQueries({ etudeId: sujet.etudeId }),
  ]);
  const queriesSujet = queries.filter((q) => q.query.sujetId === sujet.id);

  return (
    <div className="space-y-6">
      <EntetePage
        surtitre={etude.code ?? etude.nom}
        titre={sujet.subjectId}
        description={`${STATUTS_SUJET[sujet.statut] ?? sujet.statut}${centre ? ` · Centre ${centre.numero}` : ""}`}
      />
      {etude.estDemo && (
        <p className="text-xs font-semibold uppercase tracking-wide text-attention">
          Données de démonstration — sujet fictif anonymisé
        </p>
      )}

      <section>
        <h2 className="mb-3 font-titre text-lg font-bold">Timeline</h2>
        {visites.length === 0 ? (
          <EtatVide
            titre="Aucune visite planifiée pour ce sujet."
            texte="Les visites se génèrent à partir du calendrier protocolaire de l'étude."
          />
        ) : (
          <ol className="relative space-y-0 border-l border-ligne pl-6">
            {visites.map((v) => (
              <li key={v.id} className="relative pb-6">
                <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-accent" />
                <p className="font-medium">{v.nom}</p>
                <p className="text-xs text-attenue">
                  {STATUTS_VISITE_SUJET[v.statut]} · prévue {formaterDate(v.datePrevue)}
                  {v.dateReelle ? ` · réalisée ${formaterDate(v.dateReelle)}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-titre text-lg font-bold">Queries</h2>
        {queriesSujet.length === 0 ? (
          <p className="text-sm text-attenue">Aucune query sur ce sujet.</p>
        ) : (
          <ul className="carte divide-y divide-ligne">
            {queriesSujet.map((q) => (
              <li key={q.query.id}>
                <Link
                  href={`/data-management/queries/${q.query.id}`}
                  className="flex justify-between px-4 py-2.5 text-sm hover:bg-creux"
                >
                  <span>
                    {q.query.code} — {q.query.description}
                  </span>
                  <span className="text-attenue">{q.query.statut}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
