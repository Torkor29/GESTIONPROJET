import { basculerTache, supprimerTache } from "@/actions/taches";
import { demarrerChrono } from "@/actions/temps";
import FormulaireTache from "./formulaire-tache";
import { EtiquettePriorite } from "./etiquettes";
import { formaterDate } from "@/lib/format";
import type { Etude, Tache } from "@/db/schema";

export type LigneTache = {
  tache: Tache;
  etudeNom?: string | null;
  etudeCouleur?: string | null;
};

export default function ListeTaches({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucune tâche.",
}: {
  lignes: LigneTache[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-8 text-center text-sm text-muted">{message}</p>;
  }

  const maintenant = Math.floor(Date.now() / 1000);

  return (
    <ul className="carte divide-y divide-line">
      {lignes.map(({ tache, etudeNom, etudeCouleur }) => {
        const terminee = tache.statut === "terminee";
        const enRetard = !terminee && tache.echeance && tache.echeance < maintenant;

        return (
          <li key={tache.id} className="group flex items-start gap-3 px-4 py-3">
            <form action={basculerTache} className="pt-0.5">
              <input type="hidden" name="id" value={tache.id} />
              <button
                type="submit"
                aria-label={terminee ? "Rouvrir la tâche" : "Marquer comme terminée"}
                className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition
                            ${
                              terminee
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-line hover:border-accent"
                            }`}
              >
                {terminee ? "✓" : ""}
              </button>
            </form>

            <div className="min-w-0 flex-1">
              <p className={`text-sm ${terminee ? "text-muted line-through" : ""}`}>
                {tache.titre}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                {afficherEtude && etudeNom && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: etudeCouleur ?? "#a8a29e" }}
                    />
                    {etudeNom}
                  </span>
                )}
                {tache.echeance && (
                  <span className={enRetard ? "font-medium text-red-500" : ""}>
                    {enRetard ? "⚠ " : ""}
                    {formaterDate(tache.echeance)}
                  </span>
                )}
                {!terminee && <EtiquettePriorite priorite={tache.priorite} />}
                {tache.statut === "en_cours" && (
                  <span className="etiquette bg-blue-500/15 text-blue-600 dark:text-blue-300">
                    En cours
                  </span>
                )}
              </div>

              {tache.notes && <p className="mt-1.5 text-xs text-muted">{tache.notes}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
              {!terminee && (
                <form action={demarrerChrono}>
                  <input type="hidden" name="etudeId" value={tache.etudeId ?? ""} />
                  <input type="hidden" name="tacheId" value={tache.id} />
                  <button
                    type="submit"
                    title="Démarrer le chronomètre sur cette tâche"
                    aria-label="Démarrer le chronomètre sur cette tâche"
                    className="rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-line/60 hover:text-accent"
                  >
                    ⏱
                  </button>
                </form>
              )}

              <FormulaireTache tache={tache} etudes={etudes} libelle="✎" variante="icone" />

              <form action={supprimerTache}>
                <input type="hidden" name="id" value={tache.id} />
                <button
                  type="submit"
                  title="Supprimer la tâche"
                  aria-label="Supprimer la tâche"
                  className="rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-line/60 hover:text-red-500"
                >
                  ✕
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
