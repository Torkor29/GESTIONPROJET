"use client";

import { useEffect, useState, useTransition } from "react";
import { definirNoteEtudeMission, definirStatutEtudeMission } from "@/actions/taches";
import { LIBELLES_STATUT_LIGNE_MISSION } from "@/lib/constantes";
import { sigleEtude } from "@/lib/format";
import { avancement } from "@/lib/missions";
import type { EtudeLiee } from "@/lib/attribution";
import SelecteurStatutGenerique from "./selecteur-statut-generique";

const COULEURS: Record<string, string> = {
  a_faire: "text-alerte",
  en_cours: "text-info",
  terminee: "text-reussite",
  sans_objet: "text-attenue",
};

const PASTILLES: Record<string, string> = {
  a_faire: "bg-alerte",
  en_cours: "bg-info",
  terminee: "bg-reussite",
  sans_objet: "bg-efface",
};

/** Barre d'avancement d'une mission à plusieurs études : « 7/20 ». */
export function AvancementMission({ lignes }: { lignes: { statut?: string }[] }) {
  const a = avancement(lignes.map((l) => ({ statut: l.statut ?? "a_faire" })));
  return (
    <span
      className="inline-flex items-center gap-2"
      title={`${a.faites} étude(s) terminée(s) sur ${a.total}`}
    >
      <span className="sous-tache-barre w-20" aria-hidden>
        <span style={{ width: `${a.pourcentage}%` }} />
      </span>
      <span className="chiffres text-xs text-attenue">
        {a.faites}/{a.total} étude{a.total > 1 ? "s" : ""}
      </span>
    </span>
  );
}

/** Statut d'une étude au sein de la mission. */
export function StatutEtudeMission({
  tacheId,
  etude,
  verrouille = false,
}: {
  tacheId: number;
  etude: EtudeLiee;
  verrouille?: boolean;
}) {
  return (
    <SelecteurStatutGenerique
      id={etude.id}
      statut={etude.statut ?? "a_faire"}
      libelles={LIBELLES_STATUT_LIGNE_MISSION}
      couleurs={COULEURS}
      pastilles={PASTILLES}
      enregistrer={(etudeId, statut) => definirStatutEtudeMission(tacheId, etudeId, statut)}
      etiquette={`Statut pour ${sigleEtude(etude)}`}
      verrouille={verrouille}
      titreVerrou="Seule l'équipe de cette étude peut en changer l'avancement."
    />
  );
}

/**
 * Commentaire propre à une étude, modifiable sur place : on tape, on quitte
 * le champ, c'est enregistré. Sur vingt études, un formulaire par ligne
 * serait intenable.
 */
export function NoteEtudeMission({
  tacheId,
  etude,
  lectureSeule = false,
}: {
  tacheId: number;
  etude: EtudeLiee;
  lectureSeule?: boolean;
}) {
  const initiale = etude.notes ?? "";
  const [valeur, setValeur] = useState(initiale);
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState(false);

  useEffect(() => setValeur(initiale), [initiale]);

  if (lectureSeule) {
    return initiale ? <span className="text-xs text-attenue">{initiale}</span> : null;
  }

  const enregistrer = () => {
    if (valeur.trim() === initiale.trim()) return;
    demarrer(async () => {
      try {
        await definirNoteEtudeMission(tacheId, etude.id, valeur);
        setErreur(false);
      } catch {
        setErreur(true);
      }
    });
  };

  return (
    <input
      value={valeur}
      onChange={(e) => setValeur(e.target.value)}
      onBlur={enregistrer}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setValeur(initiale);
          e.currentTarget.blur();
        }
      }}
      disabled={enCours}
      placeholder="Commentaire…"
      aria-label={`Commentaire pour ${sigleEtude(etude)}`}
      title={erreur ? "Échec de l'enregistrement — réessayez." : undefined}
      className={`w-full min-w-0 rounded-lg border bg-transparent px-2 py-1 text-xs text-attenue outline-none
                  transition placeholder:text-efface hover:border-ligne focus:border-encre
                  focus:bg-relief focus:text-encre disabled:opacity-60
                  ${erreur ? "border-alerte" : "border-transparent"}`}
    />
  );
}

/**
 * L'avancement d'une mission étude par étude : chaque étude a son statut et
 * son commentaire. Le statut de la mission s'en déduit.
 */
export default function EtudesMission({
  tacheId,
  etudes,
  modifiables,
}: {
  tacheId: number;
  etudes: EtudeLiee[];
  /** Études dont la personne peut changer l'avancement. */
  modifiables: number[];
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-attenue">
          Avancement par étude
        </p>
        <AvancementMission lignes={etudes} />
      </div>
      <ul className="divide-y divide-ligne/70 rounded-xl border border-ligne/80 bg-relief/60">
        {etudes.map((e) => (
          <li
            key={e.id}
            className="grid grid-cols-[minmax(4.5rem,8rem)_9rem_1fr] items-center gap-2 px-3 py-1.5 max-sm:grid-cols-[minmax(4.5rem,8rem)_1fr]"
          >
            <span
              className="etiquette max-w-full truncate"
              style={{ backgroundColor: `${e.couleur}22`, color: e.couleur }}
              title={e.nom}
            >
              {sigleEtude(e)}
            </span>
            <StatutEtudeMission tacheId={tacheId} etude={e} verrouille={!modifiables.includes(e.id)} />
            <span className="min-w-0 max-sm:col-span-2">
              <NoteEtudeMission
                tacheId={tacheId}
                etude={e}
                lectureSeule={!modifiables.includes(e.id)}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
