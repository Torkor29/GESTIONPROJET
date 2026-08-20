"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Etude } from "@/db/schema";
import { seDeconnecter } from "@/actions/session";
import { Icone, type NomIcone } from "@/components/icones";
import Cloche from "@/components/cloche";
import type { Notification } from "@/db/schema";
import type { GroupeNav } from "@/lib/navigation";

export type LienNavigation = { href: string; libelle: string; icone: NomIcone };

function Marque() {
  return (
    <span className="flex items-center gap-2.5 font-titre text-[15px] font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-sur-accent shadow-douce">
        <Icone nom="eclair" className="h-4 w-4" />
      </span>
      Vigie
    </span>
  );
}

/** Initiales tirées du nom, pour la pastille d'identité. */
function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BarreLaterale({
  etudes,
  nom,
  role,
  groupes,
  notifications = [],
}: {
  etudes: Etude[];
  nom: string;
  role: string;
  groupes: GroupeNav[];
  notifications?: Notification[];
}) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);

  // Sur mobile, changer de page referme le tiroir.
  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  const actif = (href: string) =>
    href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);

  return (
    <>
      {/* Barre supérieure, mobile uniquement */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-ligne bg-surface/85 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={ouvert}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ligne bg-relief text-attenue shadow-posee transition-all duration-200 hover:text-encre active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="h-4.5 w-4.5"
            aria-hidden
          >
            {ouvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <Marque />
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Cloche items={notifications} />
        </div>
      </div>

      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-ligne bg-relief
                    transition-transform duration-300 ease-souple
                    lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                    ${ouvert ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 py-4">
          <Marque />
        </div>

        <nav className="space-y-3 overflow-y-auto px-3">
          {groupes.map((g, i) => (
            <div key={g.titre ?? `g-${i}`}>
              {g.titre && <p className="sur-titre px-3 pb-1 pt-1">{g.titre}</p>}
              <div className="space-y-0.5">
                {g.liens.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={actif(l.href) ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] transition-all duration-200
                                ${
                                  actif(l.href)
                                    ? "bg-accent-voile font-semibold text-accent-appuye"
                                    : "font-medium text-attenue hover:bg-creux hover:text-encre"
                                }`}
                  >
                    <Icone nom={l.icone} className="h-4 w-4 shrink-0" />
                    {l.libelle}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
          <p className="sur-titre px-3 pb-2">Mes études</p>
          {etudes.length === 0 && (
            <p className="px-3 py-1 text-xs text-efface">Aucune étude pour l&apos;instant.</p>
          )}
          {etudes.map((e) => (
            <Link
              key={e.id}
              href={`/etudes/${e.id}`}
              title={e.nom}
              className={`mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-all duration-200
                          ${
                            chemin.startsWith(`/etudes/${e.id}`)
                              ? "bg-creux font-semibold text-encre"
                              : "text-attenue hover:bg-creux hover:text-encre"
                          }`}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                style={{ backgroundColor: e.couleur }}
              />
              <span className="truncate">{e.code ?? e.nom}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-ligne p-3">
          <Link
            href="/parametres"
            aria-current={chemin === "/parametres" ? "page" : undefined}
            className={`mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200
                        ${
                          chemin === "/parametres" || chemin.startsWith("/administration")
                            ? "bg-accent-voile font-semibold text-accent-appuye"
                            : "font-medium text-attenue hover:bg-creux hover:text-encre"
                        }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] shrink-0"
              aria-hidden
            >
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
            Modules
          </Link>
          <Link
            href="/administration"
            className={`mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-attenue hover:bg-creux hover:text-encre ${
              chemin.startsWith("/administration") ? "bg-accent-voile font-semibold text-accent-appuye" : ""
            }`}
          >
            Administration
          </Link>

          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-voile font-titre text-xs font-bold text-accent-appuye"
            >
              {initiales(nom)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{nom}</span>
              <span className="block truncate text-xs text-efface">{role}</span>
            </span>
          </div>

          <form action={seDeconnecter}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-attenue transition-all duration-200 hover:bg-creux hover:text-encre"
            >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] shrink-0"
              aria-hidden
            >
                <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
