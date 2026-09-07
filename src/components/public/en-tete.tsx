"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Marque } from "@/components/marque";
import { LIENS_PUBLICS } from "@/lib/site";

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
      className={`sticky top-0 z-30 transition-[background-color,border-color] duration-300 ${
        defile ? "border-b border-ligne bg-surface/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1432px] items-center justify-between gap-3 px-5 sm:px-10">
        <Link href="/" aria-label="Vigie Clinique — accueil" className="shrink-0">
          <Marque />
        </Link>

        <nav aria-label="Pages publiques" className="hidden items-center gap-1 md:flex">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[18px] uppercase tracking-[-0.022em] transition-opacity ${
                actif(l.href) ? "text-encre" : "text-encre/70 hover:text-encre"
              }`}
            >
              {l.libelle}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/connexion" className="bouton-discret !min-h-11 !px-5 !py-2.5 text-[12px] sm:!px-8">
            Se connecter
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-encre text-encre md:hidden"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            aria-controls={idMenu}
            onClick={() => setMenuOuvert((o) => !o)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
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

      <div id={idMenu} hidden={!menuOuvert} className="border-t border-ligne bg-surface md:hidden">
        <nav aria-label="Pages publiques, menu mobile" className="mx-auto flex max-w-[1432px] flex-col px-5 py-4">
          {LIENS_PUBLICS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`min-h-12 py-3 text-[16px] uppercase tracking-[-0.025em] ${
                actif(l.href) ? "text-encre" : "text-encre/70"
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
