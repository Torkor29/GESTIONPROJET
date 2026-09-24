"use client";

import { useMemo, useState } from "react";
import type { Etude } from "@/db/schema";
import { normaliserAcronyme } from "@/lib/missions";

export type EtudeChoisissable = Pick<Etude, "id" | "nom" | "code" | "couleur">;

const libelle = (e: EtudeChoisissable) => (e.code ? `${e.code} — ${e.nom}` : e.nom);

/**
 * Choix des études d'une mission : une, plusieurs, ou aucune.
 *
 * Pensé pour les missions transverses — un archivage sur vingt études — : on
 * filtre en tapant, on coche, et un acronyme encore inconnu se crée d'un clic,
 * sans quitter le formulaire. L'étude n'est réellement créée qu'à
 * l'enregistrement de la mission : abandonner le formulaire ne laisse rien.
 */
export default function ChoixEtudes({
  id,
  etudes,
  selectionInitiale,
}: {
  id: string;
  etudes: EtudeChoisissable[];
  selectionInitiale: number[];
}) {
  const [choisies, setChoisies] = useState<number[]>(selectionInitiale);
  const [nouvelles, setNouvelles] = useState<string[]>([]);
  const [recherche, setRecherche] = useState("");

  const saisie = normaliserAcronyme(recherche);
  const filtrees = useMemo(() => {
    const q = recherche.trim().toLocaleLowerCase("fr");
    if (!q) return etudes;
    return etudes.filter((e) => libelle(e).toLocaleLowerCase("fr").includes(q));
  }, [etudes, recherche]);

  // L'acronyme tapé existe-t-il déjà, parmi les études ou parmi celles en attente ?
  const existeDeja =
    etudes.some(
      (e) => normaliserAcronyme(e.code ?? "") === saisie || normaliserAcronyme(e.nom) === saisie,
    ) || nouvelles.includes(saisie);

  const basculer = (etudeId: number) =>
    setChoisies((c) => (c.includes(etudeId) ? c.filter((x) => x !== etudeId) : [...c, etudeId]));

  const creer = () => {
    if (!saisie || existeDeja) return;
    setNouvelles((n) => [...n, saisie]);
    setRecherche("");
  };

  const toutesFiltreesCochees = filtrees.length > 0 && filtrees.every((e) => choisies.includes(e.id));
  const nombre = choisies.length + nouvelles.length;

  return (
    <div>
      {choisies.map((e) => (
        <input key={e} type="hidden" name="etudeIds" value={e} />
      ))}
      {nouvelles.map((n) => (
        <input key={n} type="hidden" name="nouvellesEtudes" value={n} />
      ))}

      <input
        id={id}
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        onKeyDown={(e) => {
          // Entrée ne doit pas envoyer toute la mission : elle crée
          // l'acronyme tapé s'il est nouveau, ou coche l'unique résultat.
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (filtrees.length === 1 && !choisies.includes(filtrees[0].id)) {
            basculer(filtrees[0].id);
            setRecherche("");
          } else creer();
        }}
        placeholder="Rechercher ou créer un acronyme…"
        autoComplete="off"
        className="champ"
      />

      {saisie && !existeDeja && (
        <button
          type="button"
          onClick={creer}
          className="mt-2 w-full rounded-lg border border-dashed border-accent/50 px-3 py-2 text-left text-sm text-accent transition hover:bg-accent/10"
        >
          + Créer l&apos;étude « <strong>{saisie}</strong> »
        </button>
      )}

      {(choisies.length > 0 || nouvelles.length > 0) && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Études retenues">
          {nouvelles.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => setNouvelles((x) => x.filter((y) => y !== n))}
                title="Retirer"
                className="etiquette bg-accent-voile text-accent-appuye"
              >
                {n} <span className="font-normal opacity-70">nouvelle ×</span>
              </button>
            </li>
          ))}
          {choisies.map((c) => {
            const e = etudes.find((x) => x.id === c);
            if (!e) return null;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => basculer(c)}
                  title={`Retirer ${e.nom}`}
                  className="etiquette"
                  style={{ backgroundColor: `${e.couleur}22`, color: e.couleur }}
                >
                  {e.code ?? e.nom} ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 rounded-xl border border-ligne">
        <div className="flex items-center justify-between border-b border-ligne px-3 py-1.5 text-xs text-attenue">
          <span>
            {nombre === 0
              ? "Sans étude"
              : `${nombre} étude${nombre > 1 ? "s" : ""} retenue${nombre > 1 ? "s" : ""}`}
            {nombre > 1 && " · une ligne de suivi par étude"}
          </span>
          {filtrees.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setChoisies((c) =>
                  toutesFiltreesCochees
                    ? c.filter((x) => !filtrees.some((e) => e.id === x))
                    : [...new Set([...c, ...filtrees.map((e) => e.id)])],
                )
              }
              className="font-medium text-accent hover:underline"
            >
              {toutesFiltreesCochees ? "Tout décocher" : "Tout cocher"}
            </button>
          )}
        </div>
        <ul className="max-h-44 overflow-y-auto py-1">
          {filtrees.length === 0 ? (
            <li className="px-3 py-2 text-xs text-efface">Aucune étude ne correspond.</li>
          ) : (
            filtrees.map((e) => (
              <li key={e.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-creux">
                  <input
                    type="checkbox"
                    checked={choisies.includes(e.id)}
                    onChange={() => basculer(e.id)}
                    className="h-4 w-4 shrink-0 accent-indigo-600"
                  />
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.couleur }}
                  />
                  <span className="truncate">{libelle(e)}</span>
                </label>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
