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
                  max-h-[calc(100vh-4rem)] overflow-y-auto rounded-xl border border-line
                  bg-raised p-0 text-ink backdrop:bg-black/50`}
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-line bg-raised px-5 py-3.5">
        <h2 className="font-semibold">{titre}</h2>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer"
          className="rounded-lg px-2 py-1 text-muted transition hover:bg-line/60 hover:text-ink"
        >
          ✕
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
