"use client";

/**
 * Aperçu de l'espace de travail, dans le hero.
 * Illustration uniquement : rien n'est cliquable.
 */
export function ApercuProduit() {
  return (
    <div className="apercu-produit relative mx-auto mt-20 max-w-3xl px-5 sm:px-0">
      <div className="carte overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ligne px-5 py-4">
          <span className="h-2 w-2 rounded-full bg-ligne" />
          <span className="h-2 w-2 rounded-full bg-ligne" />
          <span className="h-2 w-2 rounded-full bg-ligne" />
          <span className="ml-2 text-[12px] uppercase tracking-[-0.033em] text-efface">
            Protect-2 — RIPH 1
          </span>
        </div>

        <div className="space-y-6 p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="sur-titre">Étude interventionnelle</p>
              <p className="mt-2 font-titre text-[32px] tracking-[-0.02em]">PROTECT-2</p>
            </div>
            <span className="etiquette !py-2 !px-4">En cours</span>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between text-[14px]">
              <span>Checklist réglementaire</span>
              <span className="chiffres text-efface">31 / 47</span>
            </div>
            <div className="h-px overflow-hidden bg-ligne">
              <div className="apercu-barre h-full w-[66%] bg-encre" />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { t: "Soumission de l'amendement n° 3", s: "À faire", d: "1" },
              { t: "Visite de monitorage — centre 04", s: "En cours", d: "2" },
              { t: "Mise à jour du TMF", s: "Terminé", d: "3" },
            ].map((m) => (
              <div
                key={m.t}
                className={`apercu-ligne apercu-ligne-${m.d} flex items-start justify-between gap-3 rounded-full border border-ligne px-5 py-3 ${
                  m.d === "1" ? "apercu-ligne-focus" : ""
                }`}
              >
                <span className="min-w-0 flex-1 text-[14px] leading-snug">{m.t}</span>
                <span className="shrink-0 text-[12px] uppercase tracking-[-0.033em] text-efface">
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
