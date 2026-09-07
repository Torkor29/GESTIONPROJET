"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Marque } from "@/components/marque";
import { LIENS_PUBLICS } from "@/lib/site";

/**
 * En-tête des pages publiques.
 *
 * Après un léger défilement, le fond se densifie. Sur petit écran, un menu
 * s'ouvre sous la barre — pas une superposition opaque qui masquerait la page.
 */
export function EnTetePublic() {
  const chemin = usePathname();
  const [defile, setDefile] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const idMenu = useId();

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 12);
    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  useEffect(() => {
    setMenuOuvert(false);
  }, [chemin]);

  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [menuOuvert]);

  const actif = (href: string) =>
    href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);

  const liens = LIENS_PUBLICS.filter((l) => l.href !== "/");

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        defile
          ? "border-ligne bg-surface/95 shadow-posee backdrop-blur-md"
          : "border-ligne/70 bg-surface/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" aria-label="Vigie Clinique — accueil" className="shrink-0">
          <Marque />
        </Link>

        <nav aria-label="Pages publiques" className="hidden items-center gap-0.5 md:flex">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
                actif(l.href)
                  ? "bg-relief font-medium text-encre"
                  : "text-attenue hover:bg-relief hover:text-encre"
              }`}
            >
              {l.libelle}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/connexion" className="bouton-discret !py-2 text-[13px]">
            Se connecter
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ligne bg-relief text-attenue shadow-posee transition-all duration-200 hover:text-encre focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            aria-controls={idMenu}
            onClick={() => setMenuOuvert((o) => !o)}
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
              {menuOuvert ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id={idMenu}
        hidden={!menuOuvert}
        className="border-t border-ligne bg-surface md:hidden"
      >
        <nav aria-label="Pages publiques, menu mobile" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {LIENS_PUBLICS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`min-h-11 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                actif(l.href)
                  ? "bg-relief font-medium text-encre"
                  : "text-attenue hover:bg-relief hover:text-encre"
              }`}
            >
              {l.libelleLong ?? l.libelle}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
