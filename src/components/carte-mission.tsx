"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ajouterSousTache,
  basculerSousTache,
  supprimerSousTache,
  supprimerTache,
} from "@/actions/taches";
import { ajouterTempsRapide, demarrerChrono } from "@/actions/temps";
import FormulaireTache from "./formulaire-tache";
import SelecteurStatut from "./selecteur-statut";
import { EtiquettePriorite } from "./etiquettes";
import { Icone } from "./icones";
import { formaterDate, formaterDuree, statutDepuisEtapes } from "@/lib/format";
import type { CompteChoix, EtudeLiee, MembreAttribution } from "@/lib/attribution";
import type { Etude, SousTache, Tache } from "@/db/schema";

function BoutonAjouterEtape() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton-discret shrink-0 !min-h-9 !px-3 !py-1.5 !text-[11px]" disabled={pending}>
      {pending ? "…" : "Ajouter"}
    </button>
  );
}

function BoutonEnregistrerTemps() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title="Enregistrer ce temps"
      aria-label="Enregistrer ce temps"
      className="flex h-7 shrink-0 items-center rounded-lg px-2 text-[11px] font-medium uppercase tracking-wide text-accent transition hover:bg-accent-voile disabled:opacity-50"
    >
      {pending ? "…" : "OK"}
    </button>
  );
}

function SaisieDureeRapide({
  tacheId,
  sousTacheId,
  compact,
}: {
  tacheId: number;
  sousTacheId?: number;
  compact?: boolean;
}) {
  return (
    <form action={ajouterTempsRapide} className="flex min-w-0 items-center gap-1">
      <input type="hidden" name="tacheId" value={tacheId} />
      {sousTacheId ? <input type="hidden" name="sousTacheId" value={sousTacheId} /> : null}
      <input
        name="duree"
        required
        inputMode="text"
        placeholder="45 min"
        aria-label={sousTacheId ? "Temps passé sur cette étape" : "Temps passé sur cette mission"}
        className={`champ !rounded-lg !px-2 !py-1 text-xs ${compact ? "w-[4.75rem]" : "w-24"}`}
      />
      <BoutonEnregistrerTemps />
    </form>
  );
}

function EtiquetteEtude({
  nom,
  code,
  couleur,
}: {
  nom?: string | null;
  code?: string | null;
  couleur?: string | null;
}) {
  if (!nom) return null;
  return (
    <span
      className="etiquette max-w-[10rem] truncate"
      style={{
        backgroundColor: `${couleur ?? "#a8a29e"}22`,
        color: couleur ?? undefined,
      }}
      title={nom}
    >
      {code ?? nom}
    </span>
  );
}

export default function CarteMission({
  tache,
  etudeNom,
  etudeCode,
  etudeCouleur,
  sousTaches,
  minutes = 0,
  minutesParEtape = {},
  chronoEnCours = false,
  chronoSousTacheId = null,
  etudes,
  afficherEtude = true,
  etudesLiees = [],
  assigneNom = null,
  membres = [],
  comptes = [],
  peutGerer = true,
  peutEcrire = true,
}: {
  tache: Tache;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  sousTaches: SousTache[];
  minutes?: number;
  minutesParEtape?: Record<number, number>;
  chronoEnCours?: boolean;
  chronoSousTacheId?: number | null;
  etudes: Pick<Etude, "id" | "nom" | "code">[];
  afficherEtude?: boolean;
  etudesLiees?: EtudeLiee[];
  assigneNom?: string | null;
  membres?: MembreAttribution[];
  comptes?: CompteChoix[];
  peutGerer?: boolean;
  peutEcrire?: boolean;
}) {
  const statut = statutDepuisEtapes(tache.statut, sousTaches);
  const terminee = statut === "terminee";
  const maintenant = Math.floor(Date.now() / 1000);
  const enRetard = !terminee && Boolean(tache.echeance && tache.echeance < maintenant);
  const faites = sousTaches.filter((s) => s.faite).length;
  const total = sousTaches.length;
  const progression = total === 0 ? 0 : Math.round((faites / total) * 100);
  const chronoMission = chronoEnCours && chronoSousTacheId === null;

  const etiquettesEtudes =
    etudesLiees.length > 0
      ? etudesLiees
      : etudeNom
        ? [{ id: 0, nom: etudeNom, code: etudeCode ?? null, couleur: etudeCouleur ?? "#a8a29e", proprietaireId: null }]
        : [];
  const premiereCouleur = etiquettesEtudes[0]?.couleur;

  const [ouverte, setOuverte] = useState(total > 0 && faites < total);

  return (
    <article
      className={`carte-mission overflow-hidden ${terminee ? "opacity-70" : ""}`}
      style={{
        borderLeftColor: premiereCouleur ?? etudeCouleur ?? "rgb(var(--ligne))",
      }}
    >
      <div className="flex flex-wrap items-start gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOuverte((o) => !o)}
          aria-expanded={ouverte}
          aria-controls={`etapes-${tache.id}`}
          title={ouverte ? "Replier les étapes" : "Voir les étapes"}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-attenue transition hover:bg-creux hover:text-encre"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className={`h-4 w-4 transition-transform duration-300 ease-souple ${ouverte ? "rotate-90" : ""}`}
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-titre text-lg leading-snug ${terminee ? "text-attenue line-through" : ""}`}>
              {tache.titre}
            </h3>
            <EtiquettePriorite priorite={tache.priorite} />
            {(afficherEtude || etiquettesEtudes.length > 1) &&
              etiquettesEtudes.map((e) => (
                <EtiquetteEtude key={e.id || e.nom} nom={e.nom} code={e.code} couleur={e.couleur} />
              ))}
            {assigneNom && (
              <span className="etiquette bg-accent-voile text-accent-appuye">{assigneNom}</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <SelecteurStatut id={tache.id} statut={statut} verrouille={total > 0 || !peutEcrire} />
            {tache.echeance ? (
              <span className={`chiffres ${enRetard ? "font-semibold text-alerte" : "text-attenue"}`}>
                {enRetard ? "⚠ " : ""}
                {formaterDate(tache.echeance)}
              </span>
            ) : (
              <span className="text-xs text-efface">Sans échéance</span>
            )}
            {total > 0 && (
              <span className="chiffres text-xs text-attenue">
                {faites}/{total} étape{total > 1 ? "s" : ""}
              </span>
            )}
            {minutes > 0 && (
              <span className="chiffres text-xs font-medium text-accent-appuye">
                {formaterDuree(minutes)}
              </span>
            )}
          </div>

          {tache.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-attenue">{tache.notes}</p>
          )}

          {total > 0 && (
            <div className="sous-tache-barre mt-3 max-w-xs" aria-hidden>
              <span style={{ width: `${progression}%` }} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {peutEcrire && <SaisieDureeRapide tacheId={tache.id} />}
          {peutEcrire && (
          <form action={demarrerChrono}>
            <input type="hidden" name="etudeId" value={tache.etudeId ?? ""} />
            <input type="hidden" name="tacheId" value={tache.id} />
            <button
              type="submit"
              title="Démarrer le chronomètre sur cette mission"
              aria-label="Démarrer le chronomètre sur cette mission"
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-creux hover:text-accent active:scale-95
                          ${chronoMission ? "bg-accent-voile text-accent-appuye" : "text-attenue"}`}
            >
              <Icone nom="chrono" className="h-4 w-4" />
            </button>
          </form>
          )}
          {peutEcrire && (
            <FormulaireTache
              tache={tache}
              etudes={etudes}
              libelle="✎"
              variante="icone"
              statutSuitEtapes={total > 0}
              membres={membres}
              comptes={comptes}
              peutAttribuer={peutGerer}
              etudeIdsInitiales={etudesLiees.map((e) => e.id)}
            />
          )}
          {peutGerer && (
            <form action={supprimerTache}>
            <input type="hidden" name="id" value={tache.id} />
            <button
              type="submit"
              title="Supprimer la mission"
              aria-label="Supprimer la mission"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-attenue transition hover:bg-creux hover:text-alerte active:scale-95"
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
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </form>
          )}
        </div>
      </div>

      <div
        id={`etapes-${tache.id}`}
        className={`mission-replie ${ouverte ? "ouvert" : ""}`}
      >
        <div>
          <div className="border-t border-ligne/80 bg-creux/35 px-4 py-4 sm:px-5">
            {total === 0 ? (
              <p className="mb-3 text-sm text-attenue">
                {peutEcrire
                  ? "Découpez cette mission : relancer quelqu'un, attendre un retour, déposer un document…"
                  : "Aucune étape sur cette mission."}
              </p>
            ) : (
              <ul className="mb-3 space-y-2">
                {sousTaches.map((s) => {
                  const minutesEtape = minutesParEtape[s.id] ?? 0;
                  const chronoIci = chronoSousTacheId === s.id;
                  return (
                    <li key={s.id} className="group/etape flex flex-wrap items-center gap-2">
                      {peutEcrire ? (
                      <form action={basculerSousTache}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          aria-pressed={s.faite}
                          aria-label={s.faite ? `Décocher : ${s.titre}` : `Cocher : ${s.titre}`}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition
                                      ${
                                        s.faite
                                          ? "border-accent bg-accent text-sur-accent"
                                          : "border-ligne bg-relief hover:border-accent"
                                      }`}
                        >
                          {s.faite && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3" aria-hidden>
                              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </form>
                      ) : (
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
                                      ${s.faite ? "border-accent bg-accent text-sur-accent" : "border-ligne bg-relief"}`}
                          aria-hidden
                        >
                          {s.faite && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3" aria-hidden>
                              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      )}
                      <span className={`min-w-0 flex-1 text-sm leading-snug ${s.faite ? "text-attenue line-through" : ""}`}>
                        {s.titre}
                      </span>
                      {minutesEtape > 0 && (
                        <span className="chiffres text-xs text-accent-appuye">
                          {formaterDuree(minutesEtape)}
                        </span>
                      )}
                      {peutEcrire && (
                      <div className="flex items-center gap-0.5">
                        <SaisieDureeRapide tacheId={tache.id} sousTacheId={s.id} compact />
                        <form action={demarrerChrono}>
                          <input type="hidden" name="sousTacheId" value={s.id} />
                          <button
                            type="submit"
                            title={chronoIci ? "Chronomètre en cours sur cette étape" : "Démarrer le chronomètre sur cette étape"}
                            aria-label={chronoIci ? "Chronomètre en cours sur cette étape" : `Démarrer le chronomètre : ${s.titre}`}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-relief hover:text-accent
                                        ${chronoIci ? "bg-accent-voile text-accent-appuye" : "text-attenue"}`}
                          >
                            <Icone nom="chrono" className="h-3.5 w-3.5" />
                          </button>
                        </form>
                        <form action={supprimerSousTache} className="opacity-0 transition-opacity group-hover/etape:opacity-100 focus-within:opacity-100">
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            title="Retirer cette étape"
                            aria-label={`Retirer : ${s.titre}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-efface hover:text-alerte"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5" aria-hidden>
                              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                            </svg>
                          </button>
                        </form>
                      </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {peutEcrire && (
            <form action={ajouterSousTache} className="flex items-center gap-2">
              <input type="hidden" name="tacheId" value={tache.id} />
              <input
                name="titre"
                required
                maxLength={200}
                placeholder="Nouvelle étape…"
                aria-label="Nouvelle étape"
                className="champ !rounded-xl !py-2 text-sm"
              />
              <BoutonAjouterEtape />
            </form>
            )}
            {total > 0 && (
              <p className="mt-2 text-xs text-efface">
                Le total de la mission additionne le temps de chaque étape et celui saisi sur la
                mission. Sans chrono : indiquez 45, 30min ou 1h30.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
