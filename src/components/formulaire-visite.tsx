"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerVisite, modifierVisite } from "@/actions/visites";
import { VIDE } from "@/actions/etat";
import type { Etude, Visite } from "@/db/schema";
import { STATUTS_VISITE, TYPES_VISITE } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireVisite({
  visite,
  etudes,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  visite?: Visite;
  etudes: Pick<Etude, "id" | "nom">[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(visite);
  const [etat, action] = useActionState(edition ? modifierVisite : creerVisite, VIDE);

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
        title={edition ? "Modifier la visite" : undefined}
        aria-label={edition ? "Modifier la visite" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la visite" : "Nouvelle visite de monitorage"}
        large
      >
        {/* La clé suit la date de modification de l'enregistrement.
            Sans elle, les champs gardent la valeur qu'ils avaient au montage :
            changer le statut depuis le tableau puis modifier la visite
            réécrirait l'ancien statut, annulant silencieusement le changement.
            `defaultValue` ne se relit qu'au montage — la clé force ce montage. */}
        <form key={visite?.modifieLe ?? "nouvelle"} action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={visite!.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etude`}
                name="etudeId"
                defaultValue={String(visite?.etudeId ?? etudeIdParDefaut ?? "")}
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
              <label htmlFor={`${uid}-type`} className="mb-1.5 block text-sm font-medium">
                Type de visite
              </label>
              <select
                id={`${uid}-type`}
                name="type"
                defaultValue={visite?.type ?? "routine"}
                className="champ"
              >
                {Object.entries(TYPES_VISITE).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-centre`} className="mb-1.5 block text-sm font-medium">
                Centre
              </label>
              <input
                id={`${uid}-centre`}
                name="centre"
                defaultValue={visite?.centre ?? ""}
                className="champ"
                placeholder="Centre 04 — CHU de Brest"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-monitor`} className="mb-1.5 block text-sm font-medium">
                Conduite par
              </label>
              <input
                id={`${uid}-monitor`}
                name="monitorNom"
                defaultValue={visite?.monitorNom ?? ""}
                className="champ"
                placeholder="Facultatif"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-prevue`} className="mb-1.5 block text-sm font-medium">
                Date prévue
              </label>
              <input
                id={`${uid}-prevue`}
                name="datePrevue"
                type="date"
                defaultValue={versChampDate(visite?.datePrevue)}
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-realisee`} className="mb-1.5 block text-sm font-medium">
                Date réalisée
              </label>
              <input
                id={`${uid}-realisee`}
                name="dateRealisee"
                type="date"
                defaultValue={versChampDate(visite?.dateRealisee)}
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
                defaultValue={visite?.statut ?? "planifiee"}
                className="champ"
              >
                {Object.entries(STATUTS_VISITE).map(([cle, l]) => (
                  <option key={cle} value={cle}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-lettre`} className="mb-1.5 block text-sm font-medium">
                Lettre de suivi envoyée le
              </label>
              <input
                id={`${uid}-lettre`}
                name="lettreEnvoyeeLe"
                type="date"
                defaultValue={versChampDate(visite?.lettreEnvoyeeLe)}
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
              rows={3}
              defaultValue={visite?.notes ?? ""}
              className="champ"
              placeholder="Points vus, personnes rencontrées, suites à donner…"
            />
            <p className="mt-1.5 text-xs text-efface">
              Ne consignez pas ici de donnée identifiant un participant.
            </p>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer la visite"} />
        </form>
      </Modale>
    </>
  );
}
