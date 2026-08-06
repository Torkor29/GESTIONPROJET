import { definirStatutConvention, supprimerConvention } from "@/actions/conventions";
import FormulaireConvention, { type ConventionChoix } from "./formulaire-convention";
import SelecteurStatutGenerique from "./selecteur-statut-generique";
import {
  STATUTS_CONVENTION,
  STATUTS_CONVENTION_OUVERTS,
  TYPES_CONVENTION,
} from "@/lib/constantes";
import { formaterDate, formaterMontant } from "@/lib/format";
import type { Convention, Etude } from "@/db/schema";

export type LigneConvention = {
  convention: Convention;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
  parentReference?: string | null;
  parentType?: string | null;
};

/** Une convention avance vers son solde ; la couleur suit cette progression. */
const COULEURS: Record<string, string> = {
  en_negociation: "text-attenue",
  signee: "text-info",
  en_cours: "text-attention",
  soldee: "text-reussite",
  annulee: "text-efface",
};

const PASTILLES: Record<string, string> = {
  en_negociation: "bg-efface",
  signee: "bg-info",
  en_cours: "bg-attention",
  soldee: "bg-reussite",
  annulee: "bg-ligne-forte",
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

export default function TableauConventions({
  lignes,
  etudes,
  parents,
  message = "Aucune convention.",
}: {
  lignes: LigneConvention[];
  etudes: Pick<Etude, "id" | "nom">[];
  parents: ConventionChoix[];
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[58rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">Contrat</th>
            <th scope="col" className="sur-titre w-24 px-3 py-3">Étude</th>
            <th scope="col" className="sur-titre w-44 px-3 py-3">Statut</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3 text-right">Montant</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3 text-right">Perçu</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3 text-right">Reste</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Échéance</th>
            <th scope="col" className="w-20 px-3 py-3">
              <span className="sr-only">Modifier ou supprimer</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map((l) => {
            const c = l.convention;
            const ouverte = STATUTS_CONVENTION_OUVERTS.includes(c.statut);
            const reste = c.montantTotal !== null ? c.montantTotal - c.montantRecu : null;
            const enRetard = ouverte && c.dateEcheance && c.dateEcheance < maintenant && (reste ?? 0) > 0;
            // Percevoir plus que prévu n'est pas interdit, mais c'est assez
            // inhabituel pour mériter d'être signalé plutôt que caché.
            const tropPercu = reste !== null && reste < 0;

            return (
              <tr
                key={c.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <span className="block font-medium">
                    {TYPES_CONVENTION[c.type] ?? c.type}
                    {c.reference && ` ${c.reference}`}
                  </span>
                  <span className="block text-xs text-attenue">
                    {c.partie ?? "Partie non précisée"}
                    {l.parentReference && ` · avenant à ${l.parentReference}`}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <EtiquetteEtude nom={l.etudeNom} code={l.etudeCode} couleur={l.etudeCouleur} />
                </td>

                <td className="px-3 py-3">
                  <SelecteurStatutGenerique
                    id={c.id}
                    statut={c.statut}
                    libelles={STATUTS_CONVENTION}
                    couleurs={COULEURS}
                    pastilles={PASTILLES}
                    enregistrer={definirStatutConvention}
                    etiquette="Statut de la convention"
                  />
                </td>

                <td className="chiffres px-3 py-3 text-right">
                  {c.montantTotal !== null ? (
                    formaterMontant(c.montantTotal)
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="chiffres px-3 py-3 text-right">
                  {c.montantRecu > 0 ? (
                    formaterMontant(c.montantRecu)
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="chiffres px-3 py-3 text-right">
                  {reste === null ? (
                    <span className="text-efface">—</span>
                  ) : tropPercu ? (
                    <span className="font-semibold text-attention" title="Perçu au-delà du montant prévu">
                      +{formaterMontant(-reste)}
                    </span>
                  ) : reste === 0 ? (
                    <span className="text-reussite">soldé</span>
                  ) : (
                    <span className="font-medium">{formaterMontant(reste)}</span>
                  )}
                </td>

                <td className="chiffres px-3 py-3">
                  {c.dateEcheance ? (
                    <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
                      {enRetard && "⚠ "}
                      {formaterDate(c.dateEcheance)}
                    </span>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    <FormulaireConvention
                      convention={c}
                      etudes={etudes}
                      parents={parents}
                      libelle="✎"
                      variante="icone"
                    />
                    <form action={supprimerConvention}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        title="Supprimer la convention"
                        aria-label="Supprimer la convention"
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
