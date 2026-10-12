import Link from "next/link";
import { definirStatutPublipostage } from "@/actions/publipostage";
import SelecteurStatutGenerique from "./selecteur-statut-generique";
import {
  COULEURS_PUBLIPOSTAGE,
  JOURS_AVANT_RELANCE,
  PASTILLES_PUBLIPOSTAGE,
} from "./statuts-publipostage";
import { STATUTS_PUBLIPOSTAGE } from "@/lib/constantes";
import { SECONDES_PAR_JOUR, formaterDate } from "@/lib/format";
import { completude, lireValeurs, modelePublipostage } from "@/lib/publipostage";
import type { Publipostage } from "@/db/schema";

export type LignePublipostage = {
  publipostage: Publipostage;
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

/** Barre de complétude : combien de champs attendus sont déjà renseignés. */
function Completude({ pourcentage, detail }: { pourcentage: number; detail: string }) {
  return (
    <span className="flex items-center gap-2" title={detail}>
      <span className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-creux">
        <span
          className={`block h-full rounded-full ${pourcentage === 100 ? "bg-reussite" : "bg-accent"}`}
          style={{ width: `${pourcentage}%` }}
        />
      </span>
      <span className="chiffres whitespace-nowrap text-xs text-attenue">{pourcentage} %</span>
    </span>
  );
}

export default function TableauPublipostages({
  lignes,
  message = "Aucun document.",
}: {
  lignes: LignePublipostage[];
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    <div className="carte relative overflow-x-auto">
      <table className="w-full min-w-[60rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-4 py-3">Document</th>
            <th scope="col" className="sur-titre w-24 px-3 py-3">Étude</th>
            <th scope="col" className="sur-titre w-48 px-3 py-3">Statut</th>
            <th scope="col" className="sur-titre w-40 px-3 py-3">Envoi au coordo</th>
            <th scope="col" className="sur-titre w-28 px-3 py-3">Complété</th>
            <th scope="col" className="w-40 px-3 py-3">
              <span className="sr-only">Exporter ou ouvrir</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {lignes.map((l) => {
            const p = l.publipostage;
            const modele = modelePublipostage(p.modele);
            const c = modele ? completude(modele, lireValeurs(p.valeurs)) : null;

            const joursAttente =
              p.statut === "envoye_coordo" && p.envoyeLe
                ? Math.floor((maintenant - p.envoyeLe) / SECONDES_PAR_JOUR)
                : null;
            const aRelancer = joursAttente !== null && joursAttente >= JOURS_AVANT_RELANCE;

            return (
              <tr
                key={p.id}
                className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/publipostage/${p.id}`}
                    className="block font-medium hover:text-accent hover:underline"
                  >
                    {p.titre}
                  </Link>
                  <span className="block text-xs text-attenue">
                    {modele ? modele.nom : "Modèle retiré"}
                    {p.destinataire && ` · pour ${p.destinataire}`}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <EtiquetteEtude nom={l.etudeNom} code={l.etudeCode} couleur={l.etudeCouleur} />
                </td>

                <td className="px-3 py-3">
                  <SelecteurStatutGenerique
                    id={p.id}
                    statut={p.statut}
                    libelles={STATUTS_PUBLIPOSTAGE}
                    couleurs={COULEURS_PUBLIPOSTAGE}
                    pastilles={PASTILLES_PUBLIPOSTAGE}
                    enregistrer={definirStatutPublipostage}
                    etiquette="Statut du document"
                  />
                </td>

                <td className="chiffres px-3 py-3">
                  {p.envoyeLe ? (
                    <span className="block">
                      <span className="text-attenue">{formaterDate(p.envoyeLe)}</span>
                      {joursAttente !== null && (
                        <span
                          className={`block text-xs ${aRelancer ? "font-semibold text-alerte" : "text-attenue"}`}
                        >
                          {aRelancer && "⚠ "}
                          en attente depuis {joursAttente} j
                        </span>
                      )}
                      {p.retourLe && (
                        <span className="block text-xs text-attenue">
                          retour le {formaterDate(p.retourLe)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-efface">pas encore envoyé</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  {c ? (
                    <Completude
                      pourcentage={c.pourcentage}
                      detail={`${c.remplis} champ${c.remplis > 1 ? "s" : ""} sur ${c.total}`}
                    />
                  ) : (
                    <span className="text-efface">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center justify-end gap-1">
                    {/* La suppression vit sur la page du document, derrière une
                        confirmation : une fiche de cinquante champs ne doit pas
                        disparaître sur un clic égaré dans un tableau. */}
                    {modele && (
                      <>
                        <a
                          href={`/api/publipostage/${p.id}?format=docx`}
                          title="Télécharger en Word"
                          className="rounded-lg px-2 py-1 font-titre text-xs font-bold text-accent transition-colors hover:bg-relief"
                        >
                          DOCX
                        </a>
                        <a
                          href={`/api/publipostage/${p.id}?format=pdf`}
                          title="Télécharger en PDF"
                          className="rounded-lg px-2 py-1 font-titre text-xs font-bold text-accent transition-colors hover:bg-relief"
                        >
                          PDF
                        </a>
                      </>
                    )}
                    <Link
                      href={`/publipostage/${p.id}`}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-attenue transition-colors hover:bg-relief hover:text-encre"
                    >
                      Ouvrir
                    </Link>
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
