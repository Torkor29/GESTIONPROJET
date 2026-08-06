"use client";

import { useEffect, useRef, useState } from "react";
import { Icone } from "@/components/icones";

/**
 * Menu d'export à trois formats.
 *
 * Le PDF passe par l'impression du navigateur plutôt que par une bibliothèque
 * embarquée : la pagination, les en-têtes et les numéros de page sont gérés
 * nativement, rien ne tourne sur le serveur, et « Enregistrer au format PDF »
 * existe dans la boîte d'impression de tous les navigateurs, mobile compris.
 */
export default function MenuExport({
  base,
  parametres,
}: {
  /** Route d'export, par exemple `/api/export-missions`. */
  base: string;
  /** Filtres courants, repris tels quels pour n'exporter que ce qui est affiché. */
  parametres?: Record<string, string>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  // Un clic ailleurs, ou Échap, referme le menu.
  useEffect(() => {
    if (!ouvert) return;

    const auClic = (e: MouseEvent) => {
      if (!conteneur.current?.contains(e.target as Node)) setOuvert(false);
    };
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };

    document.addEventListener("mousedown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("mousedown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  const lien = (format: string) => {
    const p = new URLSearchParams(parametres ?? {});
    if (format) p.set("format", format);
    const q = p.toString();
    return q ? `${base}?${q}` : base;
  };

  return (
    <div ref={conteneur} className="relative sans-impression">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        className="bouton-discret"
      >
        <Icone nom="document" className="h-4 w-4" />
        Exporter
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {ouvert && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-64 animate-apparait overflow-hidden rounded-2xl border border-ligne bg-relief shadow-elevee"
        >
          <a
            href={lien("")}
            role="menuitem"
            onClick={() => setOuvert(false)}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-creux"
          >
            <span className="mt-0.5 font-titre text-xs font-bold text-accent">XLSX</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">Excel</span>
              <span className="block text-xs text-attenue">
                Mise en forme, filtres et totaux
              </span>
            </span>
          </a>

          <a
            href={lien("csv")}
            role="menuitem"
            onClick={() => setOuvert(false)}
            className="flex items-start gap-3 border-t border-ligne px-4 py-3 transition-colors hover:bg-creux"
          >
            <span className="mt-0.5 font-titre text-xs font-bold text-accent">CSV</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">CSV</span>
              <span className="block text-xs text-attenue">
                Pour retravailler dans n&apos;importe quel tableur
              </span>
            </span>
          </a>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOuvert(false);
              // Laisse le menu se refermer avant que la boîte d'impression
              // s'ouvre, sinon il apparaîtrait sur la page imprimée.
              setTimeout(() => window.print(), 100);
            }}
            className="flex w-full items-start gap-3 border-t border-ligne px-4 py-3 text-left transition-colors hover:bg-creux"
          >
            <span className="mt-0.5 font-titre text-xs font-bold text-accent">PDF</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">PDF ou impression</span>
              <span className="block text-xs text-attenue">
                Choisissez « Enregistrer au format PDF »
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
