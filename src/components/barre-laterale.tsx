"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Etude } from "@/db/schema";
import { seDeconnecter } from "@/actions/session";

const LIENS = [
  { href: "/", libelle: "Tableau de bord", icone: "🏠" },
  { href: "/etudes", libelle: "Études", icone: "📁" },
  { href: "/taches", libelle: "Tâches", icone: "✓" },
  { href: "/temps", libelle: "Temps", icone: "⏱" },
];

export default function BarreLaterale({ etudes }: { etudes: Etude[] }) {
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
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-line bg-raised px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={ouvert}
          className="rounded-lg border border-line px-2.5 py-1.5 text-sm"
        >
          {ouvert ? "✕" : "☰"}
        </button>
        <span className="text-sm font-semibold">Gestion de projet</span>
      </div>

      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line bg-raised
                    transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                    ${ouvert ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm">
            📁
          </div>
          <span className="text-sm font-semibold">Gestion de projet</span>
        </div>

        <nav className="px-2">
          {LIENS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                          ${
                            actif(l.href)
                              ? "bg-accent/10 font-medium text-accent"
                              : "text-ink hover:bg-line/50"
                          }`}
            >
              <span aria-hidden className="w-4 text-center">
                {l.icone}
              </span>
              {l.libelle}
            </Link>
          ))}
        </nav>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-2">
          <p className="px-3 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            Mes études
          </p>
          {etudes.length === 0 && (
            <p className="px-3 py-1 text-xs text-muted">Aucune étude pour l&apos;instant.</p>
          )}
          {etudes.map((e) => (
            <Link
              key={e.id}
              href={`/etudes/${e.id}`}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition
                          ${
                            chemin.startsWith(`/etudes/${e.id}`)
                              ? "bg-line/60 font-medium"
                              : "text-muted hover:bg-line/40 hover:text-ink"
                          }`}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: e.couleur }}
              />
              <span className="truncate">{e.nom}</span>
            </Link>
          ))}
        </div>

        <form action={seDeconnecter} className="border-t border-line p-2">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition hover:bg-line/50 hover:text-ink"
          >
            ⎋ Se déconnecter
          </button>
        </form>
      </aside>
    </>
  );
}
