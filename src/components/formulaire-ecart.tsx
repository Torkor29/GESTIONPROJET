"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerEcart, modifierEcart } from "@/actions/ecarts";
import { VIDE } from "@/actions/etat";
import type { Ecart, Etude } from "@/db/schema";
import {
  CATEGORIES_ECART,
  GRAVITES_ECART,
  STATUTS_ECART,
  TYPES_VISITE,
} from "@/lib/constantes";
import { formaterDate, versChampDate } from "@/lib/format";

export type VisiteChoix = {
  id: number;
  type: string;
  centre: string | null;
  date: number | null;
};

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireEcart({
  ecart,
  etudes,
  visites,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  ecart?: Ecart;
  etudes: Pick<Etude, "id" | "nom">[];
  visites: VisiteChoix[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(ecart);
  const [etat, action] = useActionState(edition ? modifierEcart : creerEcart, VIDE);

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
        title={edition ? "Modifier l'écart" : undefined}
        aria-label={edition ? "Modifier l'écart" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier l'écart" : "Nouvel écart"}
        large
      >
        {/* La clé suit la date de modification : sans elle, les champs
            garderaient la valeur qu'ils avaient au montage et réécriraient un
            statut modifié entre-temps depuis le tableau. */}
        <form key={ecart?.modifieLe ?? "nouveau"} action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={ecart!.id} />}

          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Écart constaté
            </label>
            <input
              id={`${uid}-titre`}
              name="titre"
              required
              autoFocus
              defaultValue={ecart?.titre}
              className="champ"
              placeholder="Visite J30 réalisée hors fenêtre protocolaire"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etude`}
                name="etudeId"
                defaultValue={String(ecart?.etudeId ?? etudeIdParDefaut ?? "")}
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
              <label htmlFor={`${uid}-visite`} className="mb-1.5 block text-sm font-medium">
                Constaté en visite
              </label>
              <select
                id={`${uid}-visite`}
                name="visiteId"
                defaultValue={String(ecart?.visiteId ?? "")}
                className="champ"
              >
                <option value="">Hors visite</option>
                {visites.map((v) => (
                  <option key={v.id} value={v.id}>
                    {TYPES_VISITE[v.type] ?? v.type}
                    {v.centre ? ` — ${v.centre}` : ""}
                    {v.date ? ` (${formaterDate(v.date)})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-reference`} className="mb-1.5 block text-sm font-medium">
                Référence
              </label>
              <input
                id={`${uid}-reference`}
                name="reference"
                defaultValue={ecart?.reference ?? ""}
                className="champ"
                placeholder="DEV-2026-014"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-centre`} className="mb-1.5 block text-sm font-medium">
                Centre
              </label>
              <input
                id={`${uid}-centre`}
                name="centre"
                defaultValue={ecart?.centre ?? ""}
                className="champ"
                placeholder="Centre 04"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-categorie`} className="mb-1.5 block text-sm font-medium">
                Catégorie
              </label>
              <select
                id={`${uid}-categorie`}
                name="categorie"
                defaultValue={ecart?.categorie ?? "protocole"}
                className="champ"
              >
                {Object.entries(CATEGORIES_ECART).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-gravite`} className="mb-1.5 block text-sm font-medium">
                Gravité
              </label>
              <select
                id={`${uid}-gravite`}
                name="gravite"
                defaultValue={ecart?.gravite ?? "mineur"}
                className="champ"
              >
                {Object.entries(GRAVITES_ECART).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-constat`} className="mb-1.5 block text-sm font-medium">
                Date de constat
              </label>
              <input
                id={`${uid}-constat`}
                name="dateConstat"
                type="date"
                defaultValue={versChampDate(ecart?.dateConstat)}
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
                defaultValue={ecart?.statut ?? "ouvert"}
                className="champ"
              >
                {Object.entries(STATUTS_ECART).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-description`} className="mb-1.5 block text-sm font-medium">
              Description et circonstances
            </label>
            <textarea
              id={`${uid}-description`}
              name="description"
              rows={3}
              defaultValue={ecart?.description ?? ""}
              className="champ"
              placeholder="Ce qui était prévu, ce qui s'est passé, l'impact éventuel…"
            />
            <p className="mt-1.5 text-xs text-efface">
              Décrivez l&apos;écart, pas la personne concernée : aucune donnée
              identifiant un participant ne doit figurer ici.
            </p>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer l'écart"} />
        </form>
      </Modale>
    </>
  );
}
