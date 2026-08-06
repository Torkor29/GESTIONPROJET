import { supprimerTache } from "@/actions/taches";
import { demarrerChrono } from "@/actions/temps";
import FormulaireTache from "./formulaire-tache";
import SelecteurStatut from "./selecteur-statut";
import { EtiquettePriorite } from "./etiquettes";
import { Icone } from "./icones";
import { formaterDate } from "@/lib/format";
import type { Etude, Tache } from "@/db/schema";

export type LigneMission = {
  tache: Tache;
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
      style={{
        backgroundColor: `${couleur ?? "#a8a29e"}22`,
        color: couleur ?? undefined,
      }}
      title={nom}
    >
      {code ?? nom}
    </span>
  );
}

export default function TableauMissions({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucune mission.",
}: {
  lignes: LigneMission[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    // Le tableau défile horizontalement dans son cadre : la page, elle, ne
    // déborde jamais, y compris sur téléphone.
    // `relative` est indispensable : sans lui, les éléments en position absolue
    // du tableau (les libellés `sr-only`) se placent par rapport à la page et
    // échappent au découpage, ce qui fait défiler tout l'écran latéralement.
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">
              Mission
            </th>
            {afficherEtude && (
              <th scope="col" className="sur-titre w-32 px-3 py-3">
                Étude
              </th>
            )}
            <th scope="col" className="sur-titre w-36 px-3 py-3">
              Statut
            </th>
            <th scope="col" className="sur-titre w-32 px-3 py-3">
              Échéance
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Commentaire
            </th>
            <th scope="col" className="w-24 px-3 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map(({ tache, etudeNom, etudeCode, etudeCouleur }) => {
            const terminee = tache.statut === "terminee";
            const enRetard = !terminee && tache.echeance && tache.echeance < maintenant;

            return (
              <tr
                key={tache.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <span className="flex items-start gap-2">
                    <span className={terminee ? "text-attenue line-through" : "font-medium"}>
                      {tache.titre}
                    </span>
                    <EtiquettePriorite priorite={tache.priorite} />
                  </span>
                </td>

                {afficherEtude && (
                  <td className="px-3 py-3">
                    <EtiquetteEtude nom={etudeNom} code={etudeCode} couleur={etudeCouleur} />
                  </td>
                )}

                <td className="px-3 py-3">
                  <SelecteurStatut id={tache.id} statut={tache.statut} />
                </td>

                <td className="chiffres px-3 py-3">
                  {tache.echeance ? (
                    <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
                      {enRetard && "⚠ "}
                      {formaterDate(tache.echeance)}
                    </span>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3 text-xs text-attenue">
                  {tache.notes ? (
                    <span className="line-clamp-2">{tache.notes}</span>
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    {!terminee && (
                      <form action={demarrerChrono}>
                        <input type="hidden" name="etudeId" value={tache.etudeId ?? ""} />
                        <input type="hidden" name="tacheId" value={tache.id} />
                        <button
                          type="submit"
                          title="Démarrer le chronomètre sur cette mission"
                          aria-label="Démarrer le chronomètre sur cette mission"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-relief hover:text-accent active:scale-95"
                        >
                          <Icone nom="chrono" className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                    <FormulaireTache tache={tache} etudes={etudes} libelle="✎" variante="icone" />
                    <form action={supprimerTache}>
                      <input type="hidden" name="id" value={tache.id} />
                      <button
                        type="submit"
                        title="Supprimer la mission"
                        aria-label="Supprimer la mission"
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
