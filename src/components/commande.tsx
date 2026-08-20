"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rechercheGlobale } from "@/actions/administration";

type Resultat = { type: string; titre: string; sousTitre: string; href: string };

export default function CommandePalette() {
  const [ouverte, setOuverte] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Resultat[]>([]);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOuverte((o) => !o);
      }
      if (e.key === "Escape") setOuverte(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (ouverte) {
      setTimeout(() => input.current?.focus(), 20);
    } else {
      setQ("");
      setRes([]);
    }
  }, [ouverte]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setRes([]);
      return;
    }
    const t = setTimeout(() => {
      start(async () => {
        const r = await rechercheGlobale(q);
        setRes(r);
      });
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  if (!ouverte) {
    return (
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="hidden items-center gap-2 rounded-xl border border-ligne bg-relief px-3 py-1.5 text-xs text-efface shadow-posee lg:flex"
      >
        Rechercher
        <kbd className="rounded-md border border-ligne bg-creux px-1.5 py-0.5 font-sans text-[10px]">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-ligne bg-relief shadow-elevee">
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Étude, sujet, query, centre, tâche…"
          className="w-full border-b border-ligne bg-transparent px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {pending && q.length >= 2 && (
            <li className="px-3 py-2 text-sm text-efface">Recherche…</li>
          )}
          {!pending && q.length >= 2 && res.length === 0 && (
            <li className="px-3 py-2 text-sm text-efface">Aucun résultat.</li>
          )}
          {res.map((r) => (
            <li key={r.href + r.titre}>
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-creux"
                onClick={() => {
                  setOuverte(false);
                  router.push(r.href);
                }}
              >
                <span className="mt-0.5 w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-efface">
                  {r.type}
                </span>
                <span>
                  <span className="block text-sm font-medium">{r.titre}</span>
                  {r.sousTitre && (
                    <span className="block text-xs text-attenue">{r.sousTitre}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-ligne px-4 py-2 text-[11px] text-efface">
          Échap pour fermer · Entrée pour ouvrir
        </p>
      </div>
    </div>
  );
}
