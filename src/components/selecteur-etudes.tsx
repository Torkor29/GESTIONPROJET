"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { sigleEtude } from "@/lib/format";

export type EtudeChoix = {
  id: number;
  nom: string;
  code?: string | null;
  couleur?: string | null;
};

/**
 * Choix d'une ou plusieurs études, par acronyme.
 *
 * Un <select multiple> natif est illisible ; on compose une liste qui tient
 * dans un champ, avec les sigles en pastilles.
 */
export default function SelecteurEtudes({
  etudes,
  ids,
  onChange,
  nom = "etudeIds",
  etiquette = "Études",
  libelleId,
}: {
  etudes: EtudeChoix[];
  ids: number[];
  onChange: (ids: number[]) => void;
  nom?: string;
  etiquette?: string;
  libelleId?: string;
}) {
  const uid = useId();
  const racine = useRef<HTMLDivElement>(null);
  const [ouverte, setOuverte] = useState(false);
  const triees = useMemo(
    () =>
      [...etudes].sort((a, b) =>
        sigleEtude(a).localeCompare(sigleEtude(b), "fr", { sensitivity: "base" }),
      ),
    [etudes],
  );
  const choisies = triees.filter((e) => ids.includes(e.id));

  useEffect(() => {
    if (!ouverte) return;
    const fermer = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuverte(false);
    };
    const clavier = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setOuverte(false);
    };
    document.addEventListener("mousedown", fermer);
    // Capture : sinon Échap ferme aussi la modale native <dialog>.
    document.addEventListener("keydown", clavier, true);
    return () => {
      document.removeEventListener("mousedown", fermer);
      document.removeEventListener("keydown", clavier, true);
    };
  }, [ouverte]);

  function retirer(id: number) {
    onChange(ids.filter((x) => x !== id));
  }

  function ajouter(id: number) {
    if (ids.includes(id)) return;
    onChange([...ids, id]);
  }

  return (
    <div ref={racine} className="relative">
      {ids.map((id) => (
        <input key={id} type="hidden" name={nom} value={id} />
      ))}

      <div
        className={`champ flex min-h-12 flex-wrap items-center gap-1.5 focus-within:border-encre
                    ${ouverte ? "border-encre" : ""}`}
        onClick={() => setOuverte(true)}
      >
        {choisies.map((e) => (
          <span
            key={e.id}
            className="inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2 pr-0.5 text-xs font-medium uppercase tracking-wide"
            title={e.nom}
            style={{
              color: e.couleur ?? undefined,
              backgroundColor: `${e.couleur ?? "#a8a29e"}22`,
              borderColor: `${e.couleur ?? "#a8a29e"}55`,
            }}
          >
            <span className="truncate">{sigleEtude(e)}</span>
            <button
              type="button"
              aria-label={`Retirer ${sigleEtude(e)}`}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-attenue hover:bg-relief hover:text-encre"
              onClick={(ev) => {
                ev.stopPropagation();
                retirer(e.id);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          id={uid}
          aria-haspopup="listbox"
          aria-expanded={ouverte}
          aria-labelledby={libelleId}
          aria-label={etiquette}
          onClick={(ev) => {
            ev.stopPropagation();
            setOuverte((o) => !o);
          }}
          className="flex min-h-8 min-w-0 flex-1 items-center justify-between gap-2 py-0.5 text-left text-sm"
        >
          <span className="truncate text-efface">
            {choisies.length === 0 ? "Choisir une ou plusieurs études" : "Ajouter"}
          </span>
          <span aria-hidden className="ml-auto shrink-0 text-efface">
            {ouverte ? "▴" : "▾"}
          </span>
        </button>
      </div>

      {ouverte && (
        <ul
          role="listbox"
          aria-multiselectable
          aria-labelledby={libelleId ?? uid}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-ligne bg-relief p-1 shadow-elevee"
        >
          {triees.length === 0 ? (
            <li className="px-3 py-2 text-sm text-attenue">Aucune étude.</li>
          ) : (
            triees.map((e) => {
              const choisie = ids.includes(e.id);
              const sigle = sigleEtude(e);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={choisie}
                    onClick={() => (choisie ? retirer(e.id) : ajouter(e.id))}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition
                                ${choisie ? "bg-accent-voile" : "hover:bg-creux"}`}
                  >
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                      style={{ backgroundColor: e.couleur ?? "#a8a29e" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{sigle}</span>
                      {Boolean(e.code?.trim()) && e.nom !== sigle && (
                        <span className="mt-0.5 block truncate text-xs text-attenue">{e.nom}</span>
                      )}
                    </span>
                    {choisie && (
                      <span aria-hidden className="text-xs font-medium text-accent-appuye">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
