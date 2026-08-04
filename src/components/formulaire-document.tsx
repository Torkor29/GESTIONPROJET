"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { modifierDocument, televerserDocument } from "@/actions/documents";
import { VIDE } from "@/actions/etat";
import type { Document, Etude } from "@/db/schema";
import { CATEGORIES_DOCUMENT } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Envoi en cours…" : libelle}
    </button>
  );
}

export default function FormulaireDocument({
  document,
  etudes,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  document?: Document;
  etudes: Pick<Etude, "id" | "nom">[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(document);
  const [etat, action] = useActionState(edition ? modifierDocument : televerserDocument, VIDE);

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
    icone: "rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-line/60 hover:text-accent",
  }[variante];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la fiche" : undefined}
        aria-label={edition ? "Modifier la fiche du document" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la fiche du document" : "Ajouter un document"}
      >
        <form action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={document!.id} />}

          {!edition && (
            <div>
              <label htmlFor={`${uid}-fichier`} className="mb-1.5 block text-sm font-medium">
                Fichier
              </label>
              <input
                id={`${uid}-fichier`}
                name="fichier"
                type="file"
                required
                className="champ file:mr-3 file:rounded file:border-0 file:bg-line file:px-3 file:py-1 file:text-sm file:text-ink"
              />
              <p className="mt-1 text-xs text-muted">
                Le fichier est stocké sur votre serveur, jamais chez un tiers.
              </p>
            </div>
          )}

          {edition && (
            <p className="rounded-lg bg-line/40 p-3 text-xs text-muted">
              Fichier d&apos;origine : <strong>{document!.nomOriginal}</strong>. Pour remplacer le
              contenu, ajoutez un nouveau document avec un numéro de version.
            </p>
          )}

          <div>
            <label htmlFor={`${uid}-nom`} className="mb-1.5 block text-sm font-medium">
              Nom du document
            </label>
            <input
              id={`${uid}-nom`}
              name="nom"
              defaultValue={document?.nom}
              placeholder="Protocole version 2.1"
              required={edition}
              className="champ"
            />
            {!edition && (
              <p className="mt-1 text-xs text-muted">
                Laissez vide pour reprendre le nom du fichier.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-categorie`} className="mb-1.5 block text-sm font-medium">
                Catégorie
              </label>
              <select
                id={`${uid}-categorie`}
                name="categorie"
                defaultValue={document?.categorie ?? "protocole"}
                className="champ"
              >
                {Object.entries(CATEGORIES_DOCUMENT).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-etudeId`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etudeId`}
                name="etudeId"
                defaultValue={document?.etudeId ?? etudeIdParDefaut ?? ""}
                className="champ"
              >
                <option value="">Document général</option>
                {etudes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-version`} className="mb-1.5 block text-sm font-medium">
                Version <span className="font-normal text-muted">(facultatif)</span>
              </label>
              <input
                id={`${uid}-version`}
                name="version"
                defaultValue={document?.version ?? ""}
                placeholder="2.1"
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-dateDocument`} className="mb-1.5 block text-sm font-medium">
                Date du document
              </label>
              <input
                id={`${uid}-dateDocument`}
                name="dateDocument"
                type="date"
                defaultValue={versChampDate(document?.dateDocument)}
                className="champ"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-description`} className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-muted">(facultatif)</span>
            </label>
            <textarea
              id={`${uid}-description`}
              name="description"
              rows={2}
              defaultValue={document?.description ?? ""}
              className="champ resize-y"
            />
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {etat.erreur}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              Annuler
            </button>
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Ajouter le document"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
