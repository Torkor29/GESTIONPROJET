"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerConvention, modifierConvention } from "@/actions/conventions";
import { VIDE } from "@/actions/etat";
import type { Convention, Etude } from "@/db/schema";
import { STATUTS_CONVENTION, TYPES_CONVENTION } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";

export type ConventionChoix = {
  id: number;
  type: string;
  reference: string | null;
  partie: string | null;
};

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

/** Un montant se saisit comme on l'écrit : la virgule décimale est acceptée. */
function champMontant(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return "";
  return String(valeur).replace(".", ",");
}

export default function FormulaireConvention({
  convention,
  etudes,
  parents,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  convention?: Convention;
  etudes: Pick<Etude, "id" | "nom">[];
  parents: ConventionChoix[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(convention);
  const [etat, envoyer] = useActionState(edition ? modifierConvention : creerConvention, VIDE);

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

  // Une convention ne peut pas se rattacher à elle-même.
  const parentsPossibles = parents.filter((p) => p.id !== convention?.id);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la convention" : undefined}
        aria-label={edition ? "Modifier la convention" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la convention" : "Nouvelle convention"}
        large
      >
        {/* Clé sur la date de modification : les champs se relisent quand
            l'enregistrement change, sinon un statut modifié depuis le tableau
            serait réécrit à l'ancienne valeur. */}
        <form key={convention?.modifieLe ?? "nouvelle"} action={envoyer} className="space-y-4">
          {edition && <input type="hidden" name="id" value={convention!.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-type`} className="mb-1.5 block text-sm font-medium">
                Type
              </label>
              <select
                id={`${uid}-type`}
                name="type"
                defaultValue={convention?.type ?? "convention"}
                className="champ"
              >
                {Object.entries(TYPES_CONVENTION).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
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
                defaultValue={convention?.reference ?? ""}
                className="champ"
                placeholder="CONV-2026-018"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etude`}
                name="etudeId"
                defaultValue={String(convention?.etudeId ?? etudeIdParDefaut ?? "")}
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
              <label htmlFor={`${uid}-partie`} className="mb-1.5 block text-sm font-medium">
                Signée avec
              </label>
              <input
                id={`${uid}-partie`}
                name="partie"
                defaultValue={convention?.partie ?? ""}
                className="champ"
                placeholder="Promoteur, CRO, centre associé…"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-parent`} className="mb-1.5 block text-sm font-medium">
                Avenant à
              </label>
              <select
                id={`${uid}-parent`}
                name="parentId"
                defaultValue={String(convention?.parentId ?? "")}
                className="champ"
              >
                <option value="">Document principal</option>
                {parentsPossibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {TYPES_CONVENTION[c.type] ?? c.type}
                    {c.reference ? ` ${c.reference}` : ""}
                    {c.partie ? ` — ${c.partie}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select
                id={`${uid}-statut`}
                name="statut"
                defaultValue={convention?.statut ?? "en_negociation"}
                className="champ"
              >
                {Object.entries(STATUTS_CONVENTION).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-total`} className="mb-1.5 block text-sm font-medium">
                Montant total (€)
              </label>
              <input
                id={`${uid}-total`}
                name="montantTotal"
                inputMode="decimal"
                defaultValue={champMontant(convention?.montantTotal)}
                className="champ"
                placeholder="12 500,50"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-recu`} className="mb-1.5 block text-sm font-medium">
                Déjà perçu (€)
              </label>
              <input
                id={`${uid}-recu`}
                name="montantRecu"
                inputMode="decimal"
                defaultValue={champMontant(convention?.montantRecu)}
                className="champ"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-signature`} className="mb-1.5 block text-sm font-medium">
                Date de signature
              </label>
              <input
                id={`${uid}-signature`}
                name="dateSignature"
                type="date"
                defaultValue={versChampDate(convention?.dateSignature)}
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-echeance`} className="mb-1.5 block text-sm font-medium">
                Dernière échéance attendue
              </label>
              <input
                id={`${uid}-echeance`}
                name="dateEcheance"
                type="date"
                defaultValue={versChampDate(convention?.dateEcheance)}
                className="champ"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-notes`} className="mb-1.5 block text-sm font-medium">
              Notes
            </label>
            <textarea
              id={`${uid}-notes`}
              name="notes"
              rows={2}
              defaultValue={convention?.notes ?? ""}
              className="champ"
              placeholder="Modalités de versement, points en suspens…"
            />
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer la convention"} />
        </form>
      </Modale>
    </>
  );
}
