"use client";

/**
 * Aperçu de l'espace de travail, dans le hero.
 *
 * L'animation sert à donner l'impression que l'outil est vivant : la barre
 * de progression se remplit, les missions apparaissent l'une après l'autre.
 * Rien n'est cliquable : c'est une illustration, pas un écran réel.
 */
export function ApercuProduit() {
  return (
    <div className="apercu-produit relative mx-auto mt-16 max-w-3xl">
      <div className="carte overflow-hidden !shadow-elevee">
        <div className="flex items-center gap-2 border-b border-ligne bg-creux px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
          <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
          <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
          <span className="ml-2 text-xs font-medium text-efface">PROTECT-2 — RIPH 1</span>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="sur-titre">Étude interventionnelle</p>
              <p className="mt-1 font-titre text-xl font-bold">PROTECT-2</p>
            </div>
            <span className="etiquette bg-reussite-voile text-reussite">En cours</span>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-medium">Checklist réglementaire</span>
              <span className="chiffres text-attenue">31 / 47</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-creux">
              <div className="apercu-barre h-full w-[66%] rounded-full bg-accent" />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { t: "Soumission de l'amendement n° 3", s: "À faire", c: "attention", d: "1" },
              { t: "Visite de monitorage — centre 04", s: "En cours", c: "info", d: "2" },
              { t: "Mise à jour du TMF", s: "Terminé", c: "reussite", d: "3" },
            ].map((m) => (
              <div
                key={m.t}
                className={`apercu-ligne apercu-ligne-${m.d} flex items-center justify-between gap-3 rounded-xl border border-ligne bg-surface px-3.5 py-2.5 ${
                  m.c === "attention" ? "apercu-ligne-focus" : ""
                }`}
              >
                <span className="truncate text-sm">{m.t}</span>
                <span
                  className={`etiquette shrink-0 ${
                    m.c === "attention"
                      ? "bg-attention-voile text-attention"
                      : m.c === "info"
                        ? "bg-info-voile text-info"
                        : "bg-reussite-voile text-reussite"
                  }`}
                >
                  {m.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
