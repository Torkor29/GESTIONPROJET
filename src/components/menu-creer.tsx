"use client";

import { useEffect, useRef, useState } from "react";
import { Icone } from "./icones";

/**
 * Menu « Créer » : regroupe les ajouts secondaires derrière un seul bouton.
 *
 * Les formulaires gardent leur propre bouton et leur modale. Le menu ne les
 * démonte jamais en se refermant — sans quoi la modale qu'on vient d'ouvrir
 * disparaîtrait avec lui : il se masque (`invisible`), et la modale, rendue
 * dans la couche supérieure, reste visible.
 */
export default function MenuCreer({ children }: { children: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    document.addEventListener("keydown", clavier);
    return () => {
      document.removeEventListener("mousedown", fermer);
      document.removeEventListener("keydown", clavier);
    };
  }, [ouvert]);

  return (
    <div ref={racine} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        className="bouton-discret"
      >
        <Icone nom="plus" className="h-4 w-4" />
        Créer
      </button>
      <div
        role="menu"
        onClickCapture={() => setOuvert(false)}
        className={`absolute right-0 z-30 mt-1.5 flex w-52 flex-col gap-0.5 rounded-xl border border-ligne bg-relief p-1 shadow-elevee
                    [&>button]:w-full [&>button]:!justify-start [&>button]:!border-0 [&>button]:!shadow-none
                    [&_dialog]:pointer-events-auto [&_dialog]:visible
                    ${ouvert ? "" : "pointer-events-none invisible"}`}
      >
        {children}
      </div>
    </div>
  );
}
