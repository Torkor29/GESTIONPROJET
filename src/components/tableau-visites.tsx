import { supprimerVisite } from "@/actions/visites";
import FormulaireVisite from "./formulaire-visite";
import SelecteurStatutVisite from "./selecteur-statut-visite";
import { STATUTS_VISITE_OUVERTS, TYPES_VISITE } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import type { Etude, Visite } from "@/db/schema";

export type LigneVisite = {
  visite: Visite;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
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

export default function TableauVisites({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucune visite.",
}: {
  lignes: LigneVisite[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    // Le tableau défile dans son cadre : la page ne déborde jamais, y compris
    // sur téléphone. `relative` empêche les libellés `sr-only` de s'en échapper.
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">Visite</th>
            {afficherEtude && <th scope="col" className="sur-titre w-28 px-3 py-3">Étude</th>}
            <th scope="col" className="sur-titre w-40 px-3 py-3">Statut</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Prévue</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Réalisée</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Lettre</th>
            <th scope="col" className="w-20 px-3 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map(({ visite, etudeNom, etudeCode, etudeCouleur }) => {
            const ouverte = STATUTS_VISITE_OUVERTS.includes(visite.statut);
            const enRetard = ouverte && visite.datePrevue && visite.datePrevue < maintenant
              && !visite.dateRealisee;

            return (
              <tr
                key={visite.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <span className="block font-medium">{TYPES_VISITE[visite.type] ?? visite.type}</span>
                  <span className="block text-xs text-attenue">
                    {visite.centre ?? "Centre non précisé"}
                    {visite.monitorNom && ` · ${visite.monitorNom}`}
                  </span>
                </td>

                {afficherEtude && (
                  <td className="px-3 py-3">
                    <EtiquetteEtude nom={etudeNom} code={etudeCode} couleur={etudeCouleur} />
                  </td>
                )}

                <td className="px-3 py-3">
                  <SelecteurStatutVisite id={visite.id} statut={visite.statut} />
                </td>

                <td className="chiffres px-3 py-3">
                  {visite.datePrevue ? (
                    <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
                      {enRetard && "⚠ "}
                      {formaterDate(visite.datePrevue)}
                    </span>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="chiffres px-3 py-3">
                  {visite.dateRealisee ? (
                    formaterDate(visite.dateRealisee)
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="chiffres px-3 py-3">
                  {visite.lettreEnvoyeeLe ? (
                    formaterDate(visite.lettreEnvoyeeLe)
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    <FormulaireVisite
                      visite={visite}
                      etudes={etudes}
                      libelle="✎"
                      variante="icone"
                    />
                    <form action={supprimerVisite}>
                      <input type="hidden" name="id" value={visite.id} />
                      <button
                        type="submit"
                        title="Supprimer la visite"
                        aria-label="Supprimer la visite"
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
