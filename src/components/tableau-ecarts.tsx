import Link from "next/link";
import { definirStatutEcart, supprimerEcart } from "@/actions/ecarts";
import FormulaireEcart, { type VisiteChoix } from "./formulaire-ecart";
import SelecteurStatutGenerique from "./selecteur-statut-generique";
import { COULEURS_ECART, PASTILLES_ECART } from "./statuts-monitorage";
import { CATEGORIES_ECART, GRAVITES_ECART, STATUTS_ECART } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import type { Ecart, Etude } from "@/db/schema";

export type LigneEcart = {
  ecart: Ecart;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  actionsOuvertes: number;
  actionsTotal: number;
};

/** La gravité se lit d'un coup d'œil : c'est elle qui dicte l'urgence. */
const TEINTES_GRAVITE: Record<string, string> = {
  mineur: "bg-creux text-attenue",
  majeur: "bg-attention-voile text-attention",
  critique: "bg-alerte-voile text-alerte",
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

export default function TableauEcarts({
  lignes,
  etudes,
  visites,
  message = "Aucun écart.",
}: {
  lignes: LigneEcart[];
  etudes: Pick<Etude, "id" | "nom">[];
  visites: VisiteChoix[];
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  return (
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[54rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">Écart</th>
            <th scope="col" className="sur-titre w-24 px-3 py-3">Étude</th>
            <th scope="col" className="sur-titre w-24 px-3 py-3">Gravité</th>
            <th scope="col" className="sur-titre w-44 px-3 py-3">Statut</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Constaté</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Actions</th>
            <th scope="col" className="w-20 px-3 py-3">
              <span className="sr-only">Modifier ou supprimer</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map(({ ecart, etudeNom, etudeCode, etudeCouleur, actionsOuvertes, actionsTotal }) => {
            // Un écart déclaré clos qui traîne encore des actions ouvertes est
            // une incohérence à signaler : c'est exactement ce qu'un auditeur
            // relèverait.
            const closMaisEnCours = ecart.statut === "clos" && actionsOuvertes > 0;

            return (
              <tr
                key={ecart.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <span className="block font-medium">{ecart.titre}</span>
                  <span className="block text-xs text-attenue">
                    {ecart.reference && `${ecart.reference} · `}
                    {CATEGORIES_ECART[ecart.categorie] ?? ecart.categorie}
                    {ecart.centre && ` · ${ecart.centre}`}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <EtiquetteEtude nom={etudeNom} code={etudeCode} couleur={etudeCouleur} />
                </td>

                <td className="px-3 py-3">
                  <span className={`etiquette ${TEINTES_GRAVITE[ecart.gravite] ?? ""}`}>
                    {GRAVITES_ECART[ecart.gravite] ?? ecart.gravite}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <SelecteurStatutGenerique
                    id={ecart.id}
                    statut={ecart.statut}
                    libelles={STATUTS_ECART}
                    couleurs={COULEURS_ECART}
                    pastilles={PASTILLES_ECART}
                    enregistrer={definirStatutEcart}
                    etiquette="Statut de l'écart"
                  />
                  {closMaisEnCours && (
                    <span className="mt-1 block text-xs font-medium text-attention">
                      ⚠ {actionsOuvertes} action{actionsOuvertes > 1 ? "s" : ""} encore ouverte
                      {actionsOuvertes > 1 ? "s" : ""}
                    </span>
                  )}
                </td>

                <td className="chiffres px-3 py-3">
                  {ecart.dateConstat ? (
                    formaterDate(ecart.dateConstat)
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  {actionsTotal > 0 ? (
                    <Link
                      href={`/actions?ecart=${ecart.id}`}
                      className="chiffres text-accent transition-opacity hover:opacity-70"
                    >
                      {actionsOuvertes}/{actionsTotal}
                    </Link>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    <FormulaireEcart
                      ecart={ecart}
                      etudes={etudes}
                      visites={visites}
                      libelle="✎"
                      variante="icone"
                    />
                    <form action={supprimerEcart}>
                      <input type="hidden" name="id" value={ecart.id} />
                      <button
                        type="submit"
                        title="Supprimer l'écart et ses actions"
                        aria-label="Supprimer l'écart"
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
