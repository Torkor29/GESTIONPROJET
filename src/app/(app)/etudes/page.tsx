import Link from "next/link";
import FormulaireEtude from "@/components/formulaire-etude";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { formaterDuree, formaterMontant, heuresDecimales } from "@/lib/format";
import { listerEtudes, totauxParEtude } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageEtudes() {
  const [etudes, totaux] = await Promise.all([
    listerEtudes({ avecArchivees: true }),
    totauxParEtude(),
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
            Créez une étude pour commencer à y ranger vos pages, vos tâches et votre temps.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {etudes.map((e) => {
            const minutes = minutesParEtude.get(e.id) ?? 0;
            const valorise = e.tarifHoraire ? heuresDecimales(minutes) * e.tarifHoraire : null;

            return (
              <Link
                key={e.id}
                href={`/etudes/${e.id}`}
                className="carte flex flex-col p-4 transition hover:border-accent/50"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span
                    aria-hidden
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: e.couleur }}
                  />
                  <EtiquetteStatutEtude statut={e.statut} />
                </div>

                <h2 className="font-medium leading-snug">{e.nom}</h2>
                {e.client && <p className="mt-0.5 text-sm text-muted">{e.client}</p>}
                {e.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{e.description}</p>
                )}

                <p className="chiffres mt-3 border-t border-line pt-3 text-sm text-muted">
                  {minutes > 0 ? formaterDuree(minutes) : "aucun temps saisi"}
                  {valorise !== null && minutes > 0 && (
                    <span className="text-ink"> · {formaterMontant(valorise)}</span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
