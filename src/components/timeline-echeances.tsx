import Link from "next/link";
import { formaterDate, SECONDES_PAR_JOUR } from "@/lib/format";
import { grilleTimeline, type MissionTimeline } from "@/lib/timeline";

/** Missions affichées dans une case avant de résumer le reste en « +N ». */
const PAR_CASE = 3;

/** Pastille d'une mission dans une case du calendrier. */
function Puce({ mission }: { mission: MissionTimeline }) {
  const libelle = mission.etudeCode ? `${mission.etudeCode} · ${mission.titre}` : mission.titre;
  return (
    <Link
      href={mission.href}
      title={libelle}
      className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] leading-tight text-encre no-underline transition hover:bg-creux"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: mission.couleur }}
        aria-hidden
      />
      <span className="truncate">{mission.titre}</span>
    </Link>
  );
}

/** « depuis 3 j », « depuis hier ». */
function retard(echeance: number, aujourdhui: number): string {
  const jours = Math.max(1, Math.round((aujourdhui - echeance) / SECONDES_PAR_JOUR));
  return jours === 1 ? "depuis hier" : `depuis ${jours} j`;
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
    new Date(j.debut * 1000).toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
  );
  const aujourdhui = grille.jours.find((j) => j.aujourdhui)?.debut ?? maintenant;

  const vide = grille.retard.length === 0 && grille.parJour.size === 0;

  return (
    <section className="bloc-app anime-bloc">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-titre text-xl font-bold">Échéances</h2>
        <p className="text-xs text-attenue">quatre semaines à partir de lundi</p>
      </div>

      {grille.retard.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-alerte" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-encre">En retard</p>
            <span className="rounded-full bg-alerte-voile/60 px-2 py-0.5 text-[11px] font-semibold text-encre">
              {grille.retard.length}
            </span>
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {grille.retard.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.href}
                  title={m.etudeCode ? `${m.etudeCode} · ${m.titre}` : m.titre}
                  className="group flex items-center gap-3 rounded-2xl border border-ligne bg-relief px-3 py-2 no-underline transition hover:border-encre/25 hover:shadow-posee"
                >
                  <span
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: m.couleur }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    {m.etudeCode && (
                      <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-efface">
                        {m.etudeCode}
                      </span>
                    )}
                    <span className="block truncate text-sm text-encre">{m.titre}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[11px] font-semibold text-alerte">
                      {retard(m.echeance, aujourdhui)}
                    </span>
                    <span className="chiffres block text-[10px] text-efface">
                      {formaterDate(m.echeance)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vide ? (
        <p className="text-sm text-attenue">Aucune échéance dans les quatre prochaines semaines.</p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="min-w-[44rem]">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {nomsJours.map((nom, i) => (
                <p
                  key={i}
                  className={`px-2 text-[10px] font-semibold uppercase tracking-wider ${
                    i >= 5 ? "text-efface" : "text-attenue"
                  }`}
                >
                  {nom}
                </p>
              ))}
            </div>
            <div className="space-y-1.5">
              {semaines.map((semaine) => (
                <div key={semaine[0]?.iso} className="grid grid-cols-7 gap-1.5">
                  {semaine.map((jour, i) => {
                    const duJour = grille.parJour.get(jour.iso) ?? [];
                    const date = new Date(jour.debut * 1000);
                    const numero = date.getDate();
                    const passe = jour.debut < aujourdhui;
                    const weekEnd = i >= 5;
                    const debutDeMois = numero === 1;
                    return (
                      <div
                        key={jour.iso}
                        className={`min-h-[5.5rem] rounded-2xl p-1.5 transition-colors ${
                          jour.aujourdhui
                            ? "bg-relief shadow-douce ring-2 ring-accent"
                            : duJour.length > 0
                              ? "border border-ligne bg-relief"
                              : weekEnd || passe
                                ? "bg-creux/40"
                                : "border border-ligne/60 bg-relief/60"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between px-1 pt-0.5">
                          <span
                            className={`chiffres text-xs ${
                              jour.aujourdhui
                                ? "grid h-6 w-6 place-items-center rounded-full bg-accent font-semibold text-sur-accent"
                                : passe
                                  ? "text-efface"
                                  : "font-medium text-encre"
                            }`}
                          >
                            {jour.aujourdhui && <span className="sr-only">Aujourd&apos;hui, </span>}
                            {numero}
                          </span>
                          {debutDeMois && !jour.aujourdhui && (
                            <span className="text-[10px] uppercase tracking-wide text-efface">
                              {date.toLocaleDateString("fr-FR", { month: "short" })}
                            </span>
                          )}
                        </div>
                        <ul>
                          {duJour.slice(0, PAR_CASE).map((m) => (
                            <li key={m.id}>
                              <Puce mission={m} />
                            </li>
                          ))}
                        </ul>
                        {duJour.length > PAR_CASE && (
                          <p
                            className="px-1.5 pt-0.5 text-[10px] font-medium text-attenue"
                            title={duJour
                              .slice(PAR_CASE)
                              .map((m) => (m.etudeCode ? `${m.etudeCode} · ${m.titre}` : m.titre))
                              .join("\n")}
                          >
                            +{duJour.length - PAR_CASE} autre{duJour.length - PAR_CASE > 1 ? "s" : ""}
                          </p>
                        )}
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
