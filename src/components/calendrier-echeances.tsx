import Link from "next/link";
import { debutDuJour, delaiRelatif, type Echeance } from "@/lib/echeances";

const JOUR = 86400;
const PAR_JOUR = 3;
const JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

/** Lundi (minuit) de la semaine contenant `instant`. */
function lundi(instant: number): number {
  const d = new Date(debutDuJour(instant) * 1000);
  const decalage = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - decalage);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Calendrier compact de quatre semaines : des cases basses, trois échéances
 * au plus par jour, le reste en « +n ». Les retards tiennent sur une ligne
 * au-dessus, plutôt que de déborder sur la grille.
 */
export default function CalendrierEcheances({
  echeances,
  maintenant,
  semaines = 4,
}: {
  echeances: Echeance[];
  maintenant: number;
  semaines?: number;
}) {
  const aujourdhui = debutDuJour(maintenant);
  const debut = lundi(maintenant);
  const parJour = new Map<number, Echeance[]>();
  for (const e of echeances) {
    const j = debutDuJour(e.date);
    parJour.set(j, [...(parJour.get(j) ?? []), e]);
  }
  const retards = echeances.filter((e) => e.date < aujourdhui).sort((a, b) => a.date - b.date);

  const jours = Array.from({ length: semaines * 7 }, (_, i) => {
    const d = new Date(debut * 1000);
    d.setDate(d.getDate() + i);
    return Math.floor(d.getTime() / 1000);
  });

  return (
    <div className="space-y-3">
      {retards.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="sur-titre !text-alerte">En retard · {retards.length}</span>
          {retards.slice(0, 6).map((e) => (
            <Link
              key={e.cle}
              href={e.href}
              title={`${e.titre} — ${delaiRelatif(e.date, maintenant)}`}
              className="inline-flex max-w-[16rem] items-center gap-1.5 rounded-md bg-alerte-voile px-2 py-0.5 text-xs text-alerte hover:opacity-80"
            >
              {e.etude && <span className="font-semibold">{e.etude}</span>}
              <span className="truncate">{e.titre}</span>
            </Link>
          ))}
          {retards.length > 6 && <span className="text-xs text-alerte">+{retards.length - 6}</span>}
        </div>
      )}

      <div className="-mx-1 overflow-x-auto px-1">
        <div className="min-w-[40rem]">
          <div className="grid grid-cols-7 gap-px pb-1">
            {JOURS.map((j) => (
              <span key={j} className="px-1.5 text-[11px] font-medium uppercase tracking-wide text-efface">
                {j}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-ligne bg-ligne">
            {jours.map((j) => {
              // Les jours passés restent vides : leurs retards sont dans la ligne du haut.
              const items = j < aujourdhui ? [] : (parJour.get(j) ?? []);
              const passe = j < aujourdhui;
              const auj = j === aujourdhui;
              const date = new Date(j * 1000);
              const weekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={j}
                  className={`min-h-[4.75rem] p-1.5 ${passe ? "bg-creux/60" : weekend ? "bg-surface" : "bg-relief"}`}
                >
                  <span
                    className={`chiffres inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] ${
                      auj ? "bg-accent font-semibold text-sur-accent" : passe ? "text-efface" : "text-attenue"
                    }`}
                  >
                    {date.getDate() === 1 || j === debut
                      ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                      : date.getDate()}
                  </span>
                  <ul className="mt-0.5 space-y-0.5">
                    {items.slice(0, PAR_JOUR).map((e) => (
                      <li key={e.cle} className="min-w-0">
                        <Link
                          href={e.href}
                          title={`${e.etude ? `${e.etude} · ` : ""}${e.titre}`}
                          className={`flex items-center gap-1 truncate rounded px-1 py-px text-[11px] leading-4 hover:bg-creux ${
                            e.nature === "jalon" ? "font-medium text-attention" : "text-encre"
                          }`}
                        >
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: e.couleur ?? "rgb(var(--efface))" }}
                          />
                          <span className="truncate">
                            {e.etude && <span className="font-semibold">{e.etude} </span>}
                            {e.titre}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {items.length > PAR_JOUR && (
                      <li className="px-1 text-[10px] text-efface">+{items.length - PAR_JOUR}</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
