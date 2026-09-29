"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fait apparaître un bloc au moment où il entre dans le viewport.
 *
 * Un seul wrapper par grande section : on n'anime pas chaque ligne.
 * Côté serveur et sans JavaScript, le bloc reste visible. Si le système
 * demande moins de mouvement, il ne se cache jamais.
 */
export function Apparition({
  children,
  className = "",
  delai = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Décalage en millisecondes, pour un léger décalage entre deux blocs. */
  delai?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    // Hors écran au chargement : on cache, puis l'observer révèle.
    // Déjà dans le viewport : on ne touche à rien, pas de clignotement.
    if (el.getBoundingClientRect().top >= window.innerHeight * 0.9) {
      setVisible(false);
    }

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`apparition ${visible ? "apparition-visible" : ""} ${className}`}
      style={delai ? { transitionDelay: `${delai}ms` } : undefined}
    >
      {children}
    </div>
  );
}
