"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  creerMissionsDepuisNote,
  noteDepuisTexteIA,
  proposerMissionsIA,
  traiterNoteIA,
} from "@/actions/ia";
import { ACTIONS_NOTE, type ActionNote, type MissionProposee } from "@/lib/ia-texte";
import { Icone } from "./icones";

type Etat =
  | { mode: "repos" }
  | { mode: "texte"; action: ActionNote; texte: string }
  | { mode: "missions"; missions: (MissionProposee & { garder: boolean })[] }
  | { mode: "fait"; message: string };

/**
 * Outils d'IA d'une note : résumer, reformuler, compte rendu, actions, et
 * missions proposées à valider. Le résultat ne remplace jamais la note : on
 * le copie, on l'enregistre comme nouvelle note, ou on crée les missions.
 */
export default function PanneauIANote({
  pageId,
  titre,
  disponible,
}: {
  pageId: number;
  titre: string;
  disponible: boolean;
}) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat>({ mode: "repos" });
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const [copie, setCopie] = useState(false);

  if (!disponible) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed border-ligne-forte px-3 py-2 text-xs text-efface">
        <Icone nom="etincelles" className="h-3.5 w-3.5" />
        IA non activée sur ce serveur (clé ASSISTANT_CLE_API absente du .env).
      </p>
    );
  }

  const lancer = (fn: () => Promise<void>) => {
    setErreur(null);
    demarrer(fn);
  };

  const traiter = (action: ActionNote) =>
    lancer(async () => {
      const r = await traiterNoteIA(pageId, action);
      if (r.ok) setEtat({ mode: "texte", action, texte: r.texte });
      else setErreur(r.erreur);
    });

  const proposer = () =>
    lancer(async () => {
      const r = await proposerMissionsIA(pageId);
      if (!r.ok) return setErreur(r.erreur);
      if (r.missions.length === 0) return setErreur("L'IA ne voit aucune mission à tirer de cette note.");
      setEtat({ mode: "missions", missions: r.missions.map((m) => ({ ...m, garder: true })) });
    });

  return (
    <section className="rounded-xl border border-ligne bg-relief p-3 shadow-posee">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 flex items-center gap-1.5 text-[13px] font-medium text-accent-appuye">
          <Icone nom="etincelles" className="h-4 w-4" />
          IA
        </span>
        {(Object.keys(ACTIONS_NOTE) as ActionNote[]).map((a) => (
          <button
            key={a}
            type="button"
            disabled={enCours}
            onClick={() => traiter(a)}
            className="bouton-fantome !py-1 text-[13px]"
          >
            {ACTIONS_NOTE[a].libelle}
          </button>
        ))}
        <button type="button" disabled={enCours} onClick={proposer} className="bouton-fantome !py-1 text-[13px]">
          Proposer des missions
        </button>
        {enCours && <span className="ml-auto animate-pulse text-xs text-efface">L&apos;IA travaille…</span>}
      </div>
      <p className="mt-1 px-1 text-[11px] text-efface">
        Le texte de la note est envoyé au fournisseur du modèle. N&apos;y mettez pas de données patients.
      </p>

      {erreur && <p className="mt-2 rounded-md bg-alerte-voile px-3 py-2 text-sm text-alerte">{erreur}</p>}

      {etat.mode === "texte" && (
        <div className="mt-3 border-t border-ligne pt-3">
          <p className="sur-titre mb-1.5">{ACTIONS_NOTE[etat.action].libelle}</p>
          <textarea
            value={etat.texte}
            onChange={(e) => setEtat({ ...etat, texte: e.target.value })}
            rows={Math.min(18, etat.texte.split("\n").length + 2)}
            className="champ resize-y font-[inherit] text-sm leading-relaxed"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours}
              onClick={() =>
                lancer(async () => {
                  const r = await noteDepuisTexteIA(pageId, `${ACTIONS_NOTE[etat.action].libelle} — ${titre}`, etat.texte);
                  if (r.ok) router.push(`/pages/${r.id}`);
                  else setErreur(r.erreur);
                })
              }
              className="bouton"
            >
              Enregistrer comme nouvelle note
            </button>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(etat.texte).catch(() => {});
                setCopie(true);
                setTimeout(() => setCopie(false), 2000);
              }}
              className="bouton-discret"
            >
              {copie ? "Copié ✓" : "Copier"}
            </button>
            <button type="button" onClick={() => setEtat({ mode: "repos" })} className="bouton-fantome">
              Fermer
            </button>
          </div>
        </div>
      )}

      {etat.mode === "missions" && (
        <div className="mt-3 border-t border-ligne pt-3">
          <p className="sur-titre mb-1.5">Missions proposées — vérifiez avant de créer</p>
          <ul className="divide-y divide-ligne rounded-lg border border-ligne">
            {etat.missions.map((m, i) => {
              const maj = (champ: Partial<MissionProposee & { garder: boolean }>) =>
                setEtat({
                  mode: "missions",
                  missions: etat.missions.map((x, j) => (j === i ? { ...x, ...champ } : x)),
                });
              return (
                <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={m.garder}
                    onChange={() => maj({ garder: !m.garder })}
                    aria-label="Garder cette mission"
                    className="h-4 w-4 accent-accent"
                  />
                  <input
                    value={m.titre}
                    onChange={(e) => maj({ titre: e.target.value })}
                    aria-label="Intitulé"
                    className="champ !py-1.5 min-w-0 flex-1"
                  />
                  <input
                    type="date"
                    value={m.echeance ?? ""}
                    onChange={(e) => maj({ echeance: e.target.value || null })}
                    aria-label="Échéance"
                    className="champ !py-1.5 w-40"
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours || !etat.missions.some((m) => m.garder)}
              onClick={() =>
                lancer(async () => {
                  const r = await creerMissionsDepuisNote(
                    pageId,
                    etat.missions.filter((m) => m.garder).map(({ titre: t, echeance, notes }) => ({ titre: t, echeance, notes })),
                  );
                  if (!r.ok) return setErreur(r.erreur);
                  setEtat({
                    mode: "fait",
                    message: `${r.creees} mission${r.creees > 1 ? "s" : ""} créée${r.creees > 1 ? "s" : ""}.`,
                  });
                  if (r.erreurs.length) setErreur(r.erreurs.join(" · "));
                })
              }
              className="bouton"
            >
              Créer {etat.missions.filter((m) => m.garder).length} mission
              {etat.missions.filter((m) => m.garder).length > 1 ? "s" : ""}
            </button>
            <button type="button" onClick={() => setEtat({ mode: "repos" })} className="bouton-fantome">
              Annuler
            </button>
          </div>
        </div>
      )}

      {etat.mode === "fait" && (
        <p className="mt-3 rounded-md bg-reussite-voile px-3 py-2 text-sm text-reussite">
          {etat.message}{" "}
          <a href="/missions" className="font-medium underline">
            Voir les missions
          </a>
        </p>
      )}
    </section>
  );
}
