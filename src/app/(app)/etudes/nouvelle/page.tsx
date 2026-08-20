"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { creerEtude } from "@/actions/etudes";
import { VIDE } from "@/actions/etat";
import { REFERENTIELS } from "@/lib/referentiels";
import { PHASES_ETUDE } from "@/lib/constantes";

function Envoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

const ETAPES = [
  "Informations générales",
  "Équipe",
  "Planning",
  "Cadre réglementaire",
  "Finalisation",
];

export default function PageNouvelleEtude() {
  const [etape, setEtape] = useState(0);
  const [etat, action] = useActionState(creerEtude, VIDE);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="sur-titre">Nouvelle étude</p>
        <h1 className="mt-1 font-titre text-3xl font-bold">Configurer l&apos;étude</h1>
        <p className="mt-2 text-sm text-attenue">
          Vous pourrez ajouter centres, visites et documents ensuite. Une étude
          vide reste utilisable : rien n&apos;est bloqué.
        </p>
      </header>

      <ol className="flex gap-1">
        {ETAPES.map((e, i) => (
          <li key={e} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= etape ? "bg-accent" : "bg-creux"}`} />
            <p className="mt-1 hidden text-[11px] text-efface sm:block">{e}</p>
          </li>
        ))}
      </ol>

      <form action={action} className="carte space-y-4 p-6">
        <div className={etape === 0 ? "space-y-4" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom de l&apos;étude</label>
            <input name="nom" required className="champ" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Acronyme</label>
              <input name="code" className="champ" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phase</label>
              <select name="phase" className="champ">
                <option value="">—</option>
                {Object.entries(PHASES_ETUDE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Indication</label>
            <input name="indication" className="champ" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Promoteur</label>
            <input name="promoteur" className="champ" />
          </div>
        </div>

        <div className={etape === 1 ? "space-y-4" : "hidden"}>
          <p className="text-sm text-attenue">
            L&apos;équipe nominative se complète ensuite sur la fiche étude. Vous
            restez propriétaire.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Investigateur principal</label>
            <input name="investigateur" className="champ" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Version du protocole</label>
            <input name="versionProtocole" className="champ" placeholder="v1.0" />
          </div>
        </div>

        <div className={etape === 2 ? "space-y-4" : "hidden"}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Début</label>
              <input name="dateDebut" type="date" className="champ" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Fin prévue</label>
              <input name="dateFin" type="date" className="champ" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Centres prévus</label>
              <input name="nbCentresPrevu" type="number" min={0} className="champ" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sujets prévus</label>
              <input name="nbSujetsPrevu" type="number" min={0} className="champ" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Population cible</label>
            <input name="populationCible" className="champ" />
          </div>
        </div>

        <fieldset className={etape === 3 ? "space-y-2" : "hidden"}>
          <legend className="mb-2 text-sm font-medium">Cadres applicables</legend>
          {REFERENTIELS.filter((r) => r.categorie === "type")
            .slice(0, 8)
            .map((r) => (
              <label key={r.cle} className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="reglementations" value={r.cle} className="mt-1" />
                {r.nom.split("—")[0].trim()}
              </label>
            ))}
        </fieldset>

        <div className={etape === 4 ? "space-y-3 text-sm" : "hidden"}>
          <p>
            L&apos;étude sera créée et restera configurable. Prochaines étapes
            suggérées : centres, visites protocolaires, équipe, documents.
          </p>
          <p className="text-attenue">
            Une étude sans donnée n&apos;est pas une erreur : les écrans vides
            proposent la suite à faire.
          </p>
        </div>

        {etat.erreur && <p className="text-sm text-alerte">{etat.erreur}</p>}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            className="bouton-discret"
            disabled={etape === 0}
            onClick={() => setEtape((e) => Math.max(0, e - 1))}
          >
            Retour
          </button>
          {etape < ETAPES.length - 1 ? (
            <button type="button" className="bouton" onClick={() => setEtape((e) => e + 1)}>
              Continuer
            </button>
          ) : (
            <Envoyer libelle="Créer l'étude" />
          )}
        </div>
      </form>
    </div>
  );
}
