import { definirStatutAction, supprimerAction } from "@/actions/ecarts";
import FormulaireAction, { type EcartChoix } from "./formulaire-action";
import SelecteurStatutGenerique from "./selecteur-statut-generique";
import { COULEURS_ACTION, PASTILLES_ACTION } from "./statuts-monitorage";
import { NATURES_ACTION, STATUTS_ACTION, STATUTS_ACTION_OUVERTS } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import type { ActionCorrective, Etude } from "@/db/schema";

export type LigneAction = {
  action: ActionCorrective;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  ecartTitre?: string | null;
  ecartReference?: string | null;
};

function EtiquetteEtude({
  nom,
  code,
  couleur,
}: {
  nom?: string | null;
  code?: string | null;
  couleur?: string | null;
}) {
  if (!nom) return <span className="text-xs text-attenue">—</span>;
  return (
    <span
      className="etiquette max-w-full truncate"
      style={{ backgroundColor: `${couleur ?? "#a8a29e"}22`, color: couleur ?? undefined }}
      title={nom}
    >
      {code ?? nom}
    </span>
  );
}

export default function TableauActions({
  lignes,
  etudes,
  ecarts,
  message = "Aucune action.",
}: {
  lignes: LigneAction[];
  etudes: Pick<Etude, "id" | "nom">[];
  ecarts: EcartChoix[];
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[54rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">Action</th>
            <th scope="col" className="sur-titre w-24 px-3 py-3">Étude</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Nature</th>
            <th scope="col" className="sur-titre w-36 px-3 py-3">Responsable</th>
            <th scope="col" className="sur-titre w-36 px-3 py-3">Statut</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Échéance</th>
            <th scope="col" className="w-20 px-3 py-3">
              <span className="sr-only">Modifier ou supprimer</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map(({ action, etudeNom, etudeCode, etudeCouleur, ecartTitre, ecartReference }) => {
            const ouverte = STATUTS_ACTION_OUVERTS.includes(action.statut);
            const enRetard = ouverte && action.echeance && action.echeance < maintenant;

            return (
              <tr
                key={action.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <span className="block font-medium">{action.titre}</span>
                  {ecartTitre && (
                    <span className="block truncate text-xs text-attenue">
                      Suite à : {ecartReference ? `${ecartReference} — ` : ""}
                      {ecartTitre}
                    </span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <EtiquetteEtude nom={etudeNom} code={etudeCode} couleur={etudeCouleur} />
                </td>

                <td className="px-3 py-3 text-xs text-attenue">
                  {NATURES_ACTION[action.nature] ?? action.nature}
                </td>

                <td className="truncate px-3 py-3 text-xs text-attenue">
                  {action.responsable ?? <span className="text-efface">—</span>}
                </td>

                <td className="px-3 py-3">
                  <SelecteurStatutGenerique
                    id={action.id}
                    statut={action.statut}
                    libelles={STATUTS_ACTION}
                    couleurs={COULEURS_ACTION}
                    pastilles={PASTILLES_ACTION}
                    enregistrer={definirStatutAction}
                    etiquette="Statut de l'action"
                  />
                </td>

                <td className="chiffres px-3 py-3">
                  {action.echeance ? (
                    <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
                      {enRetard && "⚠ "}
                      {formaterDate(action.echeance)}
                    </span>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    <FormulaireAction
                      action={action}
                      etudes={etudes}
                      ecarts={ecarts}
                      libelle="✎"
                      variante="icone"
                    />
                    <form action={supprimerAction}>
                      <input type="hidden" name="id" value={action.id} />
                      <button
                        type="submit"
                        title="Supprimer l'action"
                        aria-label="Supprimer l'action"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-relief hover:text-alerte active:scale-95"
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
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
