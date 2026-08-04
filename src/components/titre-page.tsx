"use client";

import { useEffect, useRef, useState } from "react";
import { enregistrerPage } from "@/actions/pages";

const ICONES = ["📄", "📝", "📐", "📊", "🗂", "🔬", "🏗", "⚙️", "📌", "💡", "✅", "🗺"];

export default function TitrePage({
  pageId,
  titreInitial,
  iconeInitiale,
}: {
  pageId: number;
  titreInitial: string;
  iconeInitiale: string;
}) {
  const [titre, setTitre] = useState(titreInitial);
  const [icone, setIcone] = useState(iconeInitiale);
  const [choixOuvert, setChoixOuvert] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Le titre s'enregistre après une pause de frappe, comme le corps de la page.
  useEffect(() => {
    if (titre === titreInitial) return;
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => {
      void enregistrerPage({ id: pageId, titre });
    }, 800);
    return () => {
      if (minuterie.current) clearTimeout(minuterie.current);
    };
  }, [titre, titreInitial, pageId]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setChoixOuvert((o) => !o)}
        aria-label="Changer l'icône de la page"
        aria-expanded={choixOuvert}
        className="rounded-lg px-1 text-4xl transition hover:bg-line/60"
      >
        {icone}
      </button>

      {choixOuvert && (
        <div className="absolute z-10 mt-1 flex max-w-xs flex-wrap gap-1 rounded-xl border border-line bg-raised p-2 shadow-lg">
          {ICONES.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIcone(i);
                setChoixOuvert(false);
                void enregistrerPage({ id: pageId, icone: i });
              }}
              className="rounded-lg px-2 py-1 text-xl transition hover:bg-line/60"
            >
              {i}
            </button>
          ))}
        </div>
      )}

      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Sans titre"
        aria-label="Titre de la page"
        className="mt-2 w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-muted"
      />
    </div>
  );
}
