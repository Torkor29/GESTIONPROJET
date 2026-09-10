import Link from "next/link";
import { formaterDate } from "@/lib/format";
import { grilleTimeline, type MissionTimeline } from "@/lib/timeline";

function Puce({
  mission,
  compact,
}: {
  mission: MissionTimeline;
  compact?: boolean;
}) {
  const libelle = mission.etudeCode
    ? `${mission.etudeCode} · ${mission.titre}`
    : mission.titre;
  return (
    <Link
      href={mission.href}
      title={libelle}
      className={`block max-w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight no-underline transition hover:opacity-80 ${
        compact ? "" : "sm:text-xs"
      }`}
      style={{
        backgroundColor: `${mission.couleur}22`,
        color: mission.couleur,
        boxShadow: `inset 3px 0 0 ${mission.couleur}`,
      }}
    >
      {compact ? mission.titre : libelle}
    </Link>
  );
}

export default function TimelineEcheances({
  missions,
  maintenant,
}: {
  missions: MissionTimeline[];
  maintenant: number;
}) {
  const grille = grilleTimeline(missions, maintenant);
  const semaines: (typeof grille.jours)[] = [];
  for (let i = 0; i < grille.jours.length; i += 7) {
    semaines.push(grille.jours.slice(i, i + 7));
  }
  const nomsJours = (semaines[0] ?? []).map((j) =>
    new Date(j.debut * 1000).toLocaleDateString("fr-FR", { weekday: "short" }),
  );

  const vide = grille.retard.length === 0 && grille.parJour.size === 0;

  return (
    <section className="bloc-app anime-bloc">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-titre text-xl font-bold">Échéances</h2>
        <p className="text-xs text-attenue">quatre semaines à partir de lundi · retards en tête</p>
      </div>

      {grille.retard.length > 0 && (
        <div className="mb-4 rounded-2xl border border-alerte/30 bg-alerte-voile/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-alerte">
            En retard · {grille.retard.length}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {grille.retard.map((m) => (
              <li key={m.id} className="max-w-full">
                <Puce mission={m} />
                <span className="ml-1 chiffres text-[10px] text-alerte">
                  {formaterDate(m.echeance)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vide ? (
        <p className="text-sm text-attenue">
          Aucune échéance dans les quatre prochaines semaines.
        </p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="min-w-[44rem]">
            <div className="mb-1 grid grid-cols-7 gap-1">
              {nomsJours.map((nom, i) => (
                <p
                  key={i}
                  className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-attenue"
                >
                  {nom}
                </p>
              ))}
            </div>
            <div className="space-y-1">
              {semaines.map((semaine) => (
                <div key={semaine[0]?.iso} className="grid grid-cols-7 gap-1">
                  {semaine.map((jour) => {
                    const duJour = grille.parJour.get(jour.iso) ?? [];
                    const numero = new Date(jour.debut * 1000).getDate();
                    return (
                      <div
                        key={jour.iso}
                        className={`min-h-[4.5rem] rounded-xl border p-1.5 ${
                          jour.aujourdhui
                            ? "border-accent/50 bg-accent-voile/50"
                            : "border-ligne/80 bg-creux/30"
                        }`}
                      >
                        <p
                          className={`chiffres mb-1 text-right text-[11px] ${
                            jour.aujourdhui ? "font-semibold text-accent-appuye" : "text-attenue"
                          }`}
                        >
                          {jour.aujourdhui ? (
                            <span className="sr-only">Aujourd&apos;hui </span>
                          ) : null}
                          {numero}
                        </p>
                        <ul className="space-y-0.5">
                          {duJour.map((m) => (
                            <li key={m.id}>
                              <Puce mission={m} compact />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
