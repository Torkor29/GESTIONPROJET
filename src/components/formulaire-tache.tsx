"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerTache, modifierTache } from "@/actions/taches";
import { VIDE } from "@/actions/etat";
import type { Etude, Tache } from "@/db/schema";
import { LIBELLES_PRIORITE, LIBELLES_STATUT_TACHE, versChampDate } from "@/lib/format";
import type { CompteChoix, MembreAttribution } from "@/lib/attribution";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireTache({
  tache,
  etudes,
  etudeIdParDefaut,
  etudeIdsInitiales,
  libelle,
  variante = "principal",
  statutSuitEtapes = false,
  membres = [],
  comptes = [],
  peutAttribuer = false,
}: {
  tache?: Tache;
  etudes: Pick<Etude, "id" | "nom" | "code">[];
  etudeIdParDefaut?: number;
  etudeIdsInitiales?: number[];
  libelle: string;
  variante?: "principal" | "discret" | "icone";
  /** S'il y a des étapes, le statut de la mission n'est plus saisi à la main. */
  statutSuitEtapes?: boolean;
  membres?: MembreAttribution[];
  comptes?: CompteChoix[];
  peutAttribuer?: boolean;
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(tache);
  const [etat, action] = useActionState(edition ? modifierTache : creerTache, VIDE);

  const succesVu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  const [idsChoisis, setIdsChoisis] = useState<number[]>(() => {
    if (etudeIdsInitiales && etudeIdsInitiales.length > 0) return etudeIdsInitiales;
    if (tache?.etudeId) return [tache.etudeId];
    if (etudeIdParDefaut) return [etudeIdParDefaut];
    return [];
  });
  const etudesPossedees = etudes.filter((e) => membres.some((m) => m.etudeId === e.id));
  const dejaSurLEtude = [
    ...new Map(
      membres.filter((m) => idsChoisis.includes(m.etudeId)).map((m) => [m.utilisateurId, m]),
    ).values(),
  ];
  const idsDeja = new Set(dejaSurLEtude.map((m) => m.utilisateurId));
  const autresComptes = comptes.filter((c) => !idsDeja.has(c.id));
  const editionRestreinte = edition && !peutAttribuer;

  function basculerEtude(id: number, cochee: boolean) {
    setIdsChoisis((deja) => (cochee ? [...deja, id] : deja.filter((x) => x !== id)));
  }

  const classes = {
    principal: "bouton",
    discret: "bouton-discret",
    icone: "rounded-xl px-2 py-1.5 text-sm text-attenue transition hover:bg-creux hover:text-accent",
  }[variante];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la mission" : undefined}
        aria-label={edition ? "Modifier la mission" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la mission" : "Nouvelle mission"}
        large={!edition}
      >
        {/* La clé suit la date de modification de l'enregistrement.
            Sans elle, les champs gardent la valeur qu'ils avaient au montage :
            changer le statut depuis le tableau puis modifier la mission
            réécrirait l'ancien statut, annulant silencieusement le changement.
            `defaultValue` ne se relit qu'au montage — la clé force ce montage. */}
        <form key={tache?.modifieLe ?? "nouvelle"} action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={tache!.id} />}

          {editionRestreinte ? (
            <>
              <input type="hidden" name="titre" value={tache!.titre} />
              {idsChoisis.map((id) => (
                <input key={id} type="hidden" name="etudeIds" value={id} />
              ))}
              <p className="font-titre text-lg font-bold">{tache!.titre}</p>
              <p className="text-sm text-attenue">
                Vous pouvez mettre à jour le commentaire et le statut. L&apos;attribution et
                les délais restent chez le propriétaire de l&apos;étude.
              </p>
            </>
          ) : (
            <>
          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Mission
            </label>
            <input
              id={`${uid}-titre`}
              name="titre"
              required
              autoFocus
              defaultValue={tache?.titre}
              placeholder="Déclaration de fin d'étude à l'ANSM"
              className="champ"
            />
          </div>

          {!edition && (
            <div>
              <label htmlFor={`${uid}-etapes`} className="mb-1.5 block text-sm font-medium">
                Étapes <span className="font-normal text-attenue">(une par ligne, facultatif)</span>
              </label>
              <textarea
                id={`${uid}-etapes`}
                name="lignesSousTaches"
                rows={3}
                placeholder={"Relancer le promoteur\nAttendre le retour ANSM\nDéposer le document"}
                className="champ resize-y"
              />
            </div>
          )}

          <div>
            <p className="mb-1.5 text-sm font-medium">Études concernées</p>
            {etudesPossedees.length === 0 ? (
              <p className="text-sm text-attenue">Sans étude — visible seulement dans le suivi.</p>
            ) : (
              <fieldset className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-ligne bg-creux/30 p-2.5">
                <legend className="sr-only">Études concernées</legend>
                {etudesPossedees.map((e) => (
                  <label
                    key={e.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-relief"
                  >
                    <input
                      type="checkbox"
                      name="etudeIds"
                      value={e.id}
                      checked={idsChoisis.includes(e.id)}
                      onChange={(ev) => basculerEtude(e.id, ev.target.checked)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="min-w-0 truncate">
                      {e.code ? `${e.code} — ${e.nom}` : e.nom}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <p className="mt-1 text-xs text-attenue">
              Une ou plusieurs. La mission apparaît dans le suivi et dans chaque dossier.
            </p>
          </div>

          {peutAttribuer && idsChoisis.length > 0 && (
            <div>
              <label htmlFor={`${uid}-assigneA`} className="mb-1.5 block text-sm font-medium">
                Attribuer à
              </label>
              <select
                key={idsChoisis.join("-")}
                id={`${uid}-assigneA`}
                name="assigneA"
                defaultValue={tache?.assigneA ?? ""}
                className="champ"
              >
                <option value="">Non attribuée — vous seul la voyez</option>
                {dejaSurLEtude.length > 0 && (
                  <optgroup label="Déjà sur l'étude">
                    {dejaSurLEtude.map((m) => (
                      <option key={`m-${m.utilisateurId}`} value={m.utilisateurId}>
                        {m.nom}
                      </option>
                    ))}
                  </optgroup>
                )}
                {autresComptes.length > 0 && (
                  <optgroup label="Autre compte — sera convié sur l'étude">
                    {autresComptes.map((c) => (
                      <option key={`c-${c.id}`} value={c.id}>
                        {c.nom} ({c.email})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="mt-1 text-xs text-attenue">
                La personne verra les informations de chaque étude concernée, et uniquement
                les missions qui lui sont attribuées.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-priorite`} className="mb-1.5 block text-sm font-medium">
                Priorité
              </label>
              <select
                id={`${uid}-priorite`}
                name="priorite"
                defaultValue={tache?.priorite ?? "normale"}
                className="champ"
              >
                {Object.entries(LIBELLES_PRIORITE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-echeance`} className="mb-1.5 block text-sm font-medium">
                Échéance
              </label>
              <input
                id={`${uid}-echeance`}
                name="echeance"
                type="date"
                defaultValue={versChampDate(tache?.echeance)}
                className="champ"
              />
            </div>
          </div>
            </>
          )}

          {edition && !statutSuitEtapes && (
            <div>
              <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select id={`${uid}-statut`} name="statut" defaultValue={tache!.statut} className="champ">
                {Object.entries(LIBELLES_STATUT_TACHE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}
          {edition && statutSuitEtapes && (
            <p className="text-sm text-attenue">
              Le statut suit les étapes : en cours tant qu&apos;il en reste, terminée quand
              toutes sont cochées.
            </p>
          )}

          <div>
            <label htmlFor={`${uid}-notes`} className="mb-1.5 block text-sm font-medium">
              Commentaire <span className="font-normal text-attenue">(facultatif)</span>
            </label>
            <textarea
              id={`${uid}-notes`}
              name="notes"
              rows={2}
              defaultValue={tache?.notes ?? ""}
              className="champ resize-y"
            />
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              Annuler
            </button>
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
