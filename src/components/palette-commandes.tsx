"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icone, type NomIcone } from "./icones";

export type EntreePalette = {
  cle: string;
  groupe: string;
  libelle: string;
  detail?: string | null;
  href: string;
  icone: NomIcone;
  couleur?: string | null;
};

/** Événement qui ouvre la palette depuis n'importe quel bouton de l'interface. */
export const OUVRIR_PALETTE = "vigie:palette";

/** Insensible à la casse et aux accents : « etude » trouve « Étude ». */
function normaliser(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("fr");
}

/** Au-delà, on demande de préciser plutôt que d'afficher une liste interminable. */
const MAX_PAR_GROUPE = 6;

/**
 * Palette de recherche : Ctrl+K (⌘K sur Mac) ou le champ de la barre
 * latérale. On tape, on descend aux flèches, Entrée ouvre.
 */
export default function PaletteCommandes({ entrees }: { entrees: EntreePalette[] }) {
  const router = useRouter();
  const [ouverte, setOuverte] = useState(false);
  const [q, setQ] = useState("");
  const [actif, setActif] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const dialogue = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const clavier = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOuverte((o) => !o);
      }
    };
    const ouvrir = () => setOuverte(true);
    document.addEventListener("keydown", clavier);
    window.addEventListener(OUVRIR_PALETTE, ouvrir);
    return () => {
      document.removeEventListener("keydown", clavier);
      window.removeEventListener(OUVRIR_PALETTE, ouvrir);
    };
  }, []);

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (ouverte && !d.open) {
      d.showModal();
      setQ("");
      setActif(0);
      setTimeout(() => champ.current?.focus(), 0);
    }
    if (!ouverte && d.open) d.close();
  }, [ouverte]);

  const resultats = useMemo(() => {
    const termes = normaliser(q).split(/\s+/).filter(Boolean);
    const trouvees = entrees.filter((e) => {
      if (termes.length === 0) return e.groupe === "Aller à";
      const texte = normaliser(`${e.libelle} ${e.detail ?? ""} ${e.groupe}`);
      return termes.every((t) => texte.includes(t));
    });
    const parGroupe = new Map<string, EntreePalette[]>();
    for (const e of trouvees) {
      const liste = parGroupe.get(e.groupe) ?? [];
      if (liste.length < MAX_PAR_GROUPE) liste.push(e);
      parGroupe.set(e.groupe, liste);
    }
    return [...parGroupe.entries()];
  }, [entrees, q]);

  const aplatis = resultats.flatMap(([, l]) => l);

  const ouvrir = (e: EntreePalette | undefined) => {
    if (!e) return;
    setOuverte(false);
    router.push(e.href);
  };

  let index = -1;

  return (
    <dialog
      ref={dialogue}
      onClose={() => setOuverte(false)}
      onClick={(e) => {
        if (e.target === dialogue.current) setOuverte(false);
      }}
      aria-label="Rechercher dans Vigie"
      className="mt-[12vh] w-[min(38rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-ligne bg-relief p-0 text-encre shadow-elevee backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-2.5 border-b border-ligne px-4">
        <Icone nom="loupe" className="h-4 w-4 shrink-0 text-efface" />
        <input
          ref={champ}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActif(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActif((a) => Math.min(a + 1, aplatis.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActif((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              ouvrir(aplatis[actif]);
            }
          }}
          placeholder="Rechercher une étude, une mission, une note…"
          aria-label="Rechercher"
          className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-efface"
        />
        <kbd className="shrink-0 rounded border border-ligne px-1.5 text-[11px] text-efface">Échap</kbd>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-2">
        {aplatis.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-attenue">Rien ne correspond à « {q} ».</p>
        ) : (
          resultats.map(([groupe, liste]) => (
            <div key={groupe} className="mb-1">
              <p className="sur-titre px-2.5 pb-1 pt-2">{groupe}</p>
              <ul>
                {liste.map((e) => {
                  index += 1;
                  const i = index;
                  return (
                    <li key={e.cle}>
                      <button
                        type="button"
                        onMouseMove={() => setActif(i)}
                        onClick={() => ouvrir(e)}
                        className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm ${
                          i === actif ? "bg-accent-voile text-accent-appuye" : "text-encre"
                        }`}
                      >
                        {e.couleur ? (
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: e.couleur }}
                          />
                        ) : (
                          <Icone nom={e.icone} className="h-4 w-4 shrink-0 text-efface" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{e.libelle}</span>
                        {e.detail && (
                          <span className="max-w-[45%] shrink-0 truncate text-xs text-efface">{e.detail}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-ligne px-4 py-2 text-[11px] text-efface">
        <span>↑ ↓ pour naviguer</span>
        <span>Entrée pour ouvrir</span>
        <span className="ml-auto">Ctrl K</span>
      </div>
    </dialog>
  );
}
