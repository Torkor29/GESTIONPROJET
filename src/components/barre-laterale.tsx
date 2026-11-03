"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Etude } from "@/db/schema";
import { Icone, type NomIcone } from "@/components/icones";
import { Marque } from "@/components/marque";
import { sigleEtude } from "@/lib/format";
import { OUVRIR_PALETTE } from "@/components/palette-commandes";

function BoutonRecherche({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OUVRIR_PALETTE))}
      className={`flex h-8 items-center gap-2 rounded-md border border-ligne bg-surface px-2.5 text-[13px] text-efface transition-colors hover:border-ligne-forte hover:text-attenue ${className}`}
    >
      <Icone nom="loupe" className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left">Rechercher…</span>
      <kbd className="rounded border border-ligne px-1 text-[10px]">Ctrl K</kbd>
    </button>
  );
}

export type LienNavigation = { href: string; libelle: string; icone: NomIcone };
export type RubriqueLiens = { titre: string | null; liens: LienNavigation[] };

/** Au-delà, la liste des études se replie derrière « Voir toutes ». */
const ETUDES_VISIBLES = 8;

/** Initiales tirées du nom, pour la pastille d'identité. */
function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

function LienNav({ lien, actif }: { lien: LienNavigation; actif: boolean }) {
  return (
    <Link
      href={lien.href}
      aria-current={actif ? "page" : undefined}
      className={`group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] transition-colors duration-150
                  ${
                    actif
                      ? "bg-accent-voile font-medium text-accent-appuye"
                      : "text-attenue hover:bg-creux hover:text-encre"
                  }`}
    >
      <Icone
        nom={lien.icone}
        className={`h-4 w-4 shrink-0 ${actif ? "text-accent-appuye" : "text-efface group-hover:text-attenue"}`}
      />
      <span className="truncate">{lien.libelle}</span>
    </Link>
  );
}

export default function BarreLaterale({
  etudes,
  nom,
  role,
  rubriques,
}: {
  etudes: Etude[];
  nom: string;
  role: string;
  /** Construites côté serveur à partir des modules activés par la personne. */
  rubriques: RubriqueLiens[];
}) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [etudesDepliees, setEtudesDepliees] = useState(true);
  const [toutes, setToutes] = useState(false);
  const [filtre, setFiltre] = useState("");

  // Sur mobile, changer de page referme le tiroir.
  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  const actif = (href: string) => {
    if (href === "/pense-bete" && (chemin.startsWith("/pages/") || chemin === "/notes")) {
      return true;
    }
    // Le dossier d'une étude s'ouvre depuis la liste du bas : « Études »
    // ne s'allume que sur la liste elle-même.
    if (href === "/etudes") return chemin === "/etudes";
    return chemin === href || chemin.startsWith(`${href}/`);
  };

  const triees = useMemo(
    () =>
      [...etudes].sort((a, b) =>
        sigleEtude(a).localeCompare(sigleEtude(b), "fr", { sensitivity: "base", numeric: true }),
      ),
    [etudes],
  );
  const q = filtre.trim().toLocaleLowerCase("fr");
  const filtrees = q
    ? triees.filter((e) => `${sigleEtude(e)} ${e.nom}`.toLocaleLowerCase("fr").includes(q))
    : triees;
  const affichees = toutes || q ? filtrees : filtrees.slice(0, ETUDES_VISIBLES);

  return (
    <>
      {/* Barre supérieure, mobile uniquement */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-ligne bg-relief/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={ouvert}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ligne bg-relief text-attenue transition-colors hover:text-encre"
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
            {ouvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <Marque complete={false} />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OUVRIR_PALETTE))}
          aria-label="Rechercher"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-ligne bg-relief text-attenue"
        >
          <Icone nom="loupe" className="h-4 w-4" />
        </button>
      </div>

      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-ligne bg-relief
                    transition-transform duration-300 ease-souple
                    lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                    ${ouvert ? "translate-x-0 shadow-elevee" : "-translate-x-full"}`}
      >
        <div className="flex h-14 shrink-0 items-center px-4">
          <Link href="/bord" className="rounded-md outline-offset-4">
            <Marque complete={false} />
          </Link>
        </div>

        <div className="px-2.5 pb-3">
          <BoutonRecherche className="w-full" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
          <nav aria-label="Navigation principale" className="space-y-4">
            {rubriques.map((r, i) => (
              <div key={r.titre ?? i}>
                {r.titre && <p className="sur-titre px-2 pb-1">{r.titre}</p>}
                <div className="space-y-0.5">
                  {r.liens.map((l) => (
                    <LienNav key={l.href} lien={l} actif={actif(l.href)} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* --- Accès direct aux dossiers d'étude ----------------------- */}
          <div className="mt-5 border-t border-ligne pt-4">
            <div className="flex items-center justify-between px-2 pb-1">
              <button
                type="button"
                onClick={() => setEtudesDepliees((d) => !d)}
                aria-expanded={etudesDepliees}
                className="sur-titre flex items-center gap-1 hover:text-attenue"
              >
                <Icone
                  nom="chevron"
                  className={`h-3 w-3 transition-transform ${etudesDepliees ? "rotate-90" : ""}`}
                />
                Mes études
                <span className="ml-1 font-medium normal-case tracking-normal text-efface">
                  {etudes.length}
                </span>
              </button>
              <Link
                href="/etudes"
                title="Toutes les études"
                className="rounded px-1 text-[11px] font-medium text-efface hover:text-accent-appuye"
              >
                Liste
              </Link>
            </div>

            {etudesDepliees && (
              <>
                {etudes.length > ETUDES_VISIBLES && (
                  <div className="relative mx-1 mb-1.5 mt-1">
                    <Icone
                      nom="loupe"
                      className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-efface"
                    />
                    <input
                      value={filtre}
                      onChange={(e) => setFiltre(e.target.value)}
                      placeholder="Filtrer…"
                      aria-label="Filtrer les études"
                      className="h-7 w-full rounded-md border border-ligne bg-surface pl-7 pr-2 text-xs outline-none placeholder:text-efface focus:border-accent"
                    />
                  </div>
                )}
                {etudes.length === 0 && (
                  <p className="px-2 py-1 text-xs text-efface">Aucune étude pour l&apos;instant.</p>
                )}
                <div className="space-y-0.5">
                  {affichees.map((e) => {
                    const ici = chemin.startsWith(`/etudes/${e.id}`);
                    return (
                      <Link
                        key={e.id}
                        href={`/etudes/${e.id}`}
                        title={e.nom}
                        aria-current={ici ? "page" : undefined}
                        className={`flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors
                                    ${
                                      ici
                                        ? "bg-creux font-medium text-encre"
                                        : "text-attenue hover:bg-creux hover:text-encre"
                                    }`}
                      >
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-[3px]"
                          style={{ backgroundColor: e.couleur }}
                        />
                        <span className="truncate">{sigleEtude(e)}</span>
                      </Link>
                    );
                  })}
                </div>
                {!q && filtrees.length > ETUDES_VISIBLES && (
                  <button
                    type="button"
                    onClick={() => setToutes((t) => !t)}
                    className="mt-1 px-2 text-xs font-medium text-efface hover:text-accent-appuye"
                  >
                    {toutes ? "Réduire" : `Voir les ${filtrees.length} études`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- Compte ------------------------------------------------------ */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-ligne px-3 py-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-voile text-xs font-semibold text-accent-appuye"
          >
            {initiales(nom)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight">{nom}</span>
            <span className="block truncate text-[11.5px] leading-tight text-efface">{role}</span>
          </span>
          <Link
            href="/parametres"
            title="Paramètres"
            aria-label="Paramètres"
            aria-current={chemin.startsWith("/parametres") ? "page" : undefined}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors
                        ${
                          chemin.startsWith("/parametres")
                            ? "bg-accent-voile text-accent-appuye"
                            : "text-efface hover:bg-creux hover:text-encre"
                        }`}
          >
            <Icone nom="reglages" className="h-4 w-4" />
          </Link>
          <form action="/deconnexion" method="post">
            <button
              type="submit"
              title="Se déconnecter"
              aria-label="Se déconnecter"
              className="flex h-8 w-8 items-center justify-center rounded-md text-efface transition-colors hover:bg-creux hover:text-alerte"
            >
              <Icone nom="sortie" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
