"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerFaq, modifierFaq } from "@/actions/faq";
import { VIDE } from "@/actions/etat";
import type { Etude, Faq } from "@/db/schema";
import { CATEGORIES_FAQ } from "@/lib/constantes";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireFaq({
  entree,
  etudes,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  entree?: Faq;
  etudes: Pick<Etude, "id" | "nom">[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(entree);
  const [etat, action] = useActionState(edition ? modifierFaq : creerFaq, VIDE);

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
        title={edition ? "Modifier" : undefined}
        aria-label={edition ? "Modifier cette question" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la question" : "Nouvelle question"}
        large
      >
        <form action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={entree!.id} />}

          <div>
            <label htmlFor={`${uid}-question`} className="mb-1.5 block text-sm font-medium">
              Question
            </label>
            <input
              id={`${uid}-question`}
              name="question"
              required
              autoFocus
              defaultValue={entree?.question}
              placeholder="Quand faut-il déclarer une modification substantielle au CPP ?"
              className="champ"
            />
          </div>

          <div>
            <label htmlFor={`${uid}-reponse`} className="mb-1.5 block text-sm font-medium">
              Réponse
            </label>
            <textarea
              id={`${uid}-reponse`}
              name="reponse"
              required
              rows={7}
              defaultValue={entree?.reponse}
              placeholder="Votre réponse, avec les références utiles."
              className="champ resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-categorie`} className="mb-1.5 block text-sm font-medium">
                Catégorie
              </label>
              <select
                id={`${uid}-categorie`}
                name="categorie"
                defaultValue={entree?.categorie ?? "general"}
                className="champ"
              >
                {Object.entries(CATEGORIES_FAQ).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-etudeId`} className="mb-1.5 block text-sm font-medium">
                Portée
              </label>
              <select
                id={`${uid}-etudeId`}
                name="etudeId"
                defaultValue={entree?.etudeId ?? etudeIdParDefaut ?? ""}
                className="champ"
              >
                <option value="">FAQ générale (toutes les études)</option>
                {etudes.map((e) => (
                  <option key={e.id} value={e.id}>
                    Spécifique à {e.nom}
                  </option>
                ))}
              </select>
            </div>
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
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
