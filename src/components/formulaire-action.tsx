"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerAction, modifierAction } from "@/actions/ecarts";
import { VIDE } from "@/actions/etat";
import type { ActionCorrective, Etude } from "@/db/schema";
import { NATURES_ACTION, STATUTS_ACTION } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";

export type EcartChoix = { id: number; titre: string; reference: string | null };

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireAction({
  action: correction,
  etudes,
  ecarts,
  ecartIdParDefaut,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  action?: ActionCorrective;
  etudes: Pick<Etude, "id" | "nom">[];
  ecarts: EcartChoix[];
  ecartIdParDefaut?: number;
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(correction);
  const [etat, envoyer] = useActionState(edition ? modifierAction : creerAction, VIDE);

  const succesVu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  const classes = {
    principal: "bouton",
    discret: "bouton-discret",
    icone:
      "flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-relief hover:text-accent active:scale-95",
  }[variante];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier l'action" : undefined}
        aria-label={edition ? "Modifier l'action" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier l'action" : "Nouvelle action"}
        large
      >
        {/* Clé sur la date de modification : les champs se relisent quand
            l'enregistrement change, sinon un statut modifié depuis le tableau
            serait réécrit à l'ancienne valeur. */}
        <form key={correction?.modifieLe ?? "nouvelle"} action={envoyer} className="space-y-4">
          {edition && <input type="hidden" name="id" value={correction!.id} />}

          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Action à mener
            </label>
            <input
              id={`${uid}-titre`}
              name="titre"
              required
              autoFocus
              defaultValue={correction?.titre}
              className="champ"
              placeholder="Reformer l'équipe du centre sur la fenêtre de visite"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-ecart`} className="mb-1.5 block text-sm font-medium">
                Écart à l&apos;origine
              </label>
              <select
                id={`${uid}-ecart`}
                name="ecartId"
                defaultValue={String(correction?.ecartId ?? ecartIdParDefaut ?? "")}
                className="champ"
              >
                <option value="">Aucun — action isolée</option>
                {ecarts.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.reference ? `${e.reference} — ` : ""}
                    {e.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etude`}
                name="etudeId"
                defaultValue={String(correction?.etudeId ?? etudeIdParDefaut ?? "")}
                className="champ"
              >
                <option value="">Sans étude</option>
                {etudes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-nature`} className="mb-1.5 block text-sm font-medium">
                Nature
              </label>
              <select
                id={`${uid}-nature`}
                name="nature"
                defaultValue={correction?.nature ?? "corrective"}
                className="champ"
              >
                {Object.entries(NATURES_ACTION).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-responsable`} className="mb-1.5 block text-sm font-medium">
                Responsable
              </label>
              <input
                id={`${uid}-responsable`}
                name="responsable"
                defaultValue={correction?.responsable ?? ""}
                className="champ"
                placeholder="Nom ou fonction"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-echeance`} className="mb-1.5 block text-sm font-medium">
                Échéance
              </label>
              <input
                id={`${uid}-echeance`}
                name="echeance"
                type="date"
                defaultValue={versChampDate(correction?.echeance)}
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select
                id={`${uid}-statut`}
                name="statut"
                defaultValue={correction?.statut ?? "a_faire"}
                className="champ"
              >
                {Object.entries(STATUTS_ACTION).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-description`} className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <textarea
              id={`${uid}-description`}
              name="description"
              rows={2}
              defaultValue={correction?.description ?? ""}
              className="champ"
            />
          </div>

          <div>
            <label htmlFor={`${uid}-efficacite`} className="mb-1.5 block text-sm font-medium">
              Vérification de l&apos;efficacité
            </label>
            <textarea
              id={`${uid}-efficacite`}
              name="efficacite"
              rows={2}
              defaultValue={correction?.efficacite ?? ""}
              className="champ"
              placeholder="Ce qui a été constaté après l'action, et quand"
            />
            <p className="mt-1.5 text-xs text-efface">
              Une action « faite » n&apos;est close qu&apos;une fois son effet
              constaté — d&apos;où l&apos;étape « vérifiée ».
            </p>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer l'action"} />
        </form>
      </Modale>
    </>
  );
}
