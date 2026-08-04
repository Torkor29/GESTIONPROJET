import Link from "next/link";
import FormulaireEtude from "@/components/formulaire-etude";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { formaterDuree } from "@/lib/format";
import { listerEtudes, progressionParEtude, totauxParEtude } from "@/lib/requetes";
import { lireReglementations, referentiel } from "@/lib/referentiels";

export const dynamic = "force-dynamic";

export default async function PageEtudes() {
  const [etudes, totaux, progressions] = await Promise.all([
    listerEtudes({ avecArchivees: true }),
    totauxParEtude(),
    progressionParEtude(),
  ]);

  const minutesParEtude = new Map(totaux.map((t) => [t.etudeId, t.minutes]));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Études</h1>
          <p className="mt-1 text-sm text-muted">
            {etudes.length} {etudes.length > 1 ? "études" : "étude"}
          </p>
        </div>
        <FormulaireEtude libelle="Nouvelle étude" />
      </header>

      {etudes.length === 0 ? (
        <div className="carte p-10 text-center">
          <p className="text-sm text-muted">
            Créez une étude pour y ranger ses pages, ses missions, ses documents et ses checklists
            réglementaires.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etudes.map((e) => {
            const minutes = minutesParEtude.get(e.id) ?? 0;
            const prog = progressions.get(e.id);
            const reglements = lireReglementations(e.reglementations)
              .map((c) => referentiel(c))
              .filter((r) => r !== undefined);
            const typePrincipal = reglements.find((r) => r.categorie === "type");

            return (
              <Link
                key={e.id}
                href={`/etudes/${e.id}`}
                className="carte group flex flex-col overflow-hidden transition hover:border-accent/50"
              >
                {e.imageCouverture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.imageCouverture}
                    alt=""
                    className="h-32 w-full object-cover transition group-hover:opacity-90"
                  />
                ) : (
                  <div
                    className="h-32 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${e.couleur}33, ${e.couleur}0d)`,
                    }}
                  />
                )}

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: e.couleur }}
                      />
                      {e.code && (
                        <span className="truncate text-xs font-semibold tracking-wide text-muted">
                          {e.code}
                        </span>
                      )}
                    </span>
                    <EtiquetteStatutEtude statut={e.statut} />
                  </div>

                  <h2 className="font-medium leading-snug">{e.nom}</h2>
                  {e.promoteur && (
                    <p className="mt-0.5 truncate text-sm text-muted">{e.promoteur}</p>
                  )}

                  {typePrincipal && (
                    <p className="mt-2">
                      <span className="etiquette bg-accent/10 text-accent">
                        {typePrincipal.nom.split("—")[0].trim()}
                      </span>
                    </p>
                  )}

                  <div className="mt-auto pt-3">
                    {prog && prog.total > 0 && (
                      <div className="mb-2">
                        <div className="mb-1 flex items-baseline justify-between text-xs text-muted">
                          <span>Conformité réglementaire</span>
                          <span className="chiffres">{prog.pourcentage} %</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${prog.pourcentage}%`,
                              backgroundColor: e.couleur,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <p className="chiffres border-t border-line pt-2.5 text-xs text-muted">
                      {minutes > 0 ? formaterDuree(minutes) : "aucun temps saisi"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
