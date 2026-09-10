"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerEtude, modifierEtude } from "@/actions/etudes";
import { VIDE } from "@/actions/etat";
import type { Etude } from "@/db/schema";
import { LIBELLES_STATUT_ETUDE, versChampDate } from "@/lib/format";
import { PALETTE_COULEURS } from "@/lib/couleurs";
import { REFERENTIELS, lireReglementations } from "@/lib/referentiels";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ligne pt-4">
      <legend className="pr-2 text-xs font-semibold uppercase tracking-wide text-attenue">
        {titre}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export default function FormulaireEtude({
  etude,
  libelle,
  variante = "principal",
}: {
  etude?: Etude;
  libelle: string;
  variante?: "principal" | "discret";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(etude);
  const [etat, action] = useActionState(edition ? modifierEtude : creerEtude, VIDE);

  const succesVu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      // Un avertissement mérite d'être lu : la modale reste ouverte pour l'afficher.
      if (!etat.avertissement) setOuverte(false);
    }
  }, [etat.succes, etat.avertissement]);

  const cochees = lireReglementations(etude?.reglementations);
  const types = REFERENTIELS.filter((r) => r.categorie === "type");
  const transversaux = REFERENTIELS.filter((r) => r.categorie === "transversal");

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className={variante === "principal" ? "bouton" : "bouton-discret"}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier l'étude" : "Nouvelle étude"}
        large
      >
        <form action={action} className="space-y-5">
          {edition && <input type="hidden" name="id" value={etude!.id} />}

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor={`${uid}-nom`} className="mb-1.5 block text-sm font-medium">
                Nom de l&apos;étude
              </label>
              <input
                id={`${uid}-nom`}
                name="nom"
                required
                autoFocus
                defaultValue={etude?.nom}
                placeholder="Évaluation de la sédation par isoflurane en réanimation"
                className="champ"
              />
            </div>
            <div className="sm:w-32">
              <label htmlFor={`${uid}-code`} className="mb-1.5 block text-sm font-medium">
                Acronyme
              </label>
              <input
                id={`${uid}-code`}
                name="code"
                defaultValue={etude?.code ?? ""}
                placeholder="INASED"
                className="champ uppercase"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-description`} className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-attenue">(facultatif)</span>
            </label>
            <textarea
              id={`${uid}-description`}
              name="description"
              rows={2}
              defaultValue={etude?.description ?? ""}
              className="champ resize-y"
            />
          </div>

          <Section titre="Cadre réglementaire">
            <p className="text-xs text-attenue">
              Cochez le type de recherche : les checklists correspondantes seront créées
              automatiquement pour cette étude.
            </p>

            <div className="space-y-2">
              {types.map((r) => (
                <label
                  key={r.cle}
                  className="flex cursor-pointer gap-2.5 rounded-lg border border-ligne p-3 transition hover:border-accent/50"
                >
                  <input
                    type="checkbox"
                    name="reglementations"
                    value={r.cle}
                    defaultChecked={cochees.includes(r.cle)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{r.nom}</span>
                    <span className="mt-0.5 block text-xs text-attenue">{r.resume}</span>
                  </span>
                </label>
              ))}
            </div>

            <p className="pt-1 text-xs font-medium uppercase tracking-wide text-attenue">
              Référentiels transversaux
            </p>
            <div className="space-y-2">
              {transversaux.map((r) => (
                <label
                  key={r.cle}
                  className="flex cursor-pointer gap-2.5 rounded-lg border border-ligne p-3 transition hover:border-accent/50"
                >
                  <input
                    type="checkbox"
                    name="reglementations"
                    value={r.cle}
                    defaultChecked={cochees.includes(r.cle)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{r.nom}</span>
                    <span className="mt-0.5 block text-xs text-attenue">{r.resume}</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section titre="Identification">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-promoteur`} className="mb-1.5 block text-sm font-medium">
                  Promoteur
                </label>
                <input
                  id={`${uid}-promoteur`}
                  name="promoteur"
                  defaultValue={etude?.promoteur ?? ""}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-investigateur`} className="mb-1.5 block text-sm font-medium">
                  Investigateur coordonnateur
                </label>
                <input
                  id={`${uid}-investigateur`}
                  name="investigateur"
                  defaultValue={etude?.investigateur ?? ""}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-idRcb`} className="mb-1.5 block text-sm font-medium">
                  ID-RCB
                </label>
                <input
                  id={`${uid}-idRcb`}
                  name="idRcb"
                  defaultValue={etude?.idRcb ?? ""}
                  placeholder="2026-A00123-45"
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-numeroCtis`} className="mb-1.5 block text-sm font-medium">
                  N° CTIS / EudraCT / NCT
                </label>
                <input
                  id={`${uid}-numeroCtis`}
                  name="numeroCtis"
                  defaultValue={etude?.numeroCtis ?? ""}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-numeroCpp`} className="mb-1.5 block text-sm font-medium">
                  Référence CPP
                </label>
                <input
                  id={`${uid}-numeroCpp`}
                  name="numeroCpp"
                  defaultValue={etude?.numeroCpp ?? ""}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-client`} className="mb-1.5 block text-sm font-medium">
                  Partenaire ou financeur
                </label>
                <input
                  id={`${uid}-client`}
                  name="client"
                  defaultValue={etude?.client ?? ""}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-dateDebut`} className="mb-1.5 block text-sm font-medium">
                  Date de début
                </label>
                <input
                  id={`${uid}-dateDebut`}
                  name="dateDebut"
                  type="date"
                  defaultValue={versChampDate(etude?.dateDebut)}
                  className="champ"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-dateFin`} className="mb-1.5 block text-sm font-medium">
                  Date de fin prévue
                </label>
                <input
                  id={`${uid}-dateFin`}
                  name="dateFin"
                  type="date"
                  defaultValue={versChampDate(etude?.dateFin)}
                  className="champ"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-dateFinInclusion`} className="mb-1.5 block text-sm font-medium">
                  Date de fin d&apos;inclusion prévue
                </label>
                <input
                  id={`${uid}-dateFinInclusion`}
                  name="dateFinInclusion"
                  type="date"
                  defaultValue={versChampDate(etude?.dateFinInclusion)}
                  className="champ sm:max-w-xs"
                />
                <p className="mt-1 text-xs text-attenue">
                  Distincte de la fin d&apos;étude. Affichée sur le tableau de bord pour voir si
                  l&apos;inclusion est encore ouverte, sans ouvrir chaque dossier.
                </p>
              </div>
            </div>
          </Section>

          <Section titre="Présentation">
            <div>
              <label htmlFor={`${uid}-imageCouverture`} className="mb-1.5 block text-sm font-medium">
                Image de couverture{" "}
                <span className="font-normal text-attenue">(facultatif)</span>
              </label>
              <input
                id={`${uid}-imageCouverture`}
                name="imageCouverture"
                type="file"
                accept="image/*"
                className="champ file:mr-3 file:rounded file:border-0 file:bg-creux file:px-3 file:py-1 file:text-sm file:text-encre"
              />
              {etude?.imageCouverture && (
                <p className="mt-1 text-xs text-attenue">
                  Une image est déjà en place. En choisir une nouvelle la remplacera.
                </p>
              )}
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Couleur</legend>
              <div className="flex flex-wrap gap-2">
                {PALETTE_COULEURS.map((c, i) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      name="couleur"
                      value={c}
                      defaultChecked={etude ? etude.couleur === c : i === 0}
                      className="peer sr-only"
                    />
                    <span
                      className="block h-7 w-7 rounded-full ring-offset-2 ring-offset-raised transition
                                 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2"
                      style={{ backgroundColor: c }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-tarifHoraire`} className="mb-1.5 block text-sm font-medium">
                  Tarif horaire <span className="font-normal text-attenue">(€/h, facultatif)</span>
                </label>
                <input
                  id={`${uid}-tarifHoraire`}
                  name="tarifHoraire"
                  inputMode="decimal"
                  defaultValue={etude?.tarifHoraire ?? ""}
                  className="champ"
                />
              </div>
              {edition && (
                <div>
                  <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
                    Statut
                  </label>
                  <select id={`${uid}-statut`} name="statut" defaultValue={etude!.statut} className="champ">
                    {Object.entries(LIBELLES_STATUT_ETUDE).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Section>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}
          {etat.avertissement && (
            <p
              role="status"
              className="rounded-lg bg-attention-voile/50 p-3 text-sm text-attenue"
            >
              {etat.avertissement}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-ligne pt-4">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              {etat.avertissement ? "Fermer" : "Annuler"}
            </button>
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer l'étude"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
