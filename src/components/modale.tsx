"use client";

import { useEffect, useRef } from "react";

/**
 * Modale accessible bâtie sur <dialog> : Échap ferme, le focus est piégé
 * à l'intérieur et l'arrière-plan est inerte, sans dépendance externe.
 */
export default function Modale({
  ouverte,
  onFermer,
  titre,
  large = false,
  children,
}: {
  ouverte: boolean;
  onFermer: () => void;
  titre: string;
  /** Élargit la modale pour les formulaires longs. */
  large?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (ouverte && !dlg.open) dlg.showModal();
    if (!ouverte && dlg.open) dlg.close();
  }, [ouverte]);

  return (
    <dialog
      ref={ref}
      onClose={onFermer}
      onClick={(e) => {
        // Un clic sur le fond (la zone du <dialog> hors du contenu) referme.
        if (e.target === ref.current) onFermer();
      }}
      className={`${large ? "w-[min(46rem,calc(100vw-2rem))]" : "w-[min(32rem,calc(100vw-2rem))]"}
                  max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-ligne
                  bg-relief p-0 text-encre shadow-elevee
                  backdrop:bg-black/50 backdrop:backdrop-blur-[2px]
                  open:animate-apparait`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ligne bg-relief px-5 py-3.5">
        <h2 className="font-titre font-bold">{titre}</h2>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-creux hover:text-encre active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
