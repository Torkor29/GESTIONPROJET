import { actualiserReferentiel, basculerChecklist, basculerSansObjet } from "@/actions/checklists";
import NoteChecklist from "./note-checklist";
import { formaterDate } from "@/lib/format";
import { progression } from "@/lib/requetes";
import { AVERTISSEMENT, LIBELLES_PHASE, ORDRE_PHASES, type Phase, referentiel } from "@/lib/referentiels";
import type { ChecklistItem } from "@/db/schema";

export default function Checklist({
  etudeId,
  lignes,
}: {
  etudeId: number;
  lignes: ChecklistItem[];
}) {
  if (lignes.length === 0) {
    return (
      <div className="carte p-8 text-center">
        <p className="text-sm text-attenue">
          Aucune checklist pour cette étude. Modifiez l&apos;étude et cochez le cadre
          réglementaire applicable pour les générer automatiquement.
        </p>
      </div>
    );
  }

  // Regroupement par référentiel, puis par phase.
  const parReferentiel = new Map<string, ChecklistItem[]>();
  for (const l of lignes) {
    parReferentiel.set(l.referentiel, [...(parReferentiel.get(l.referentiel) ?? []), l]);
  }

  const globale = progression(lignes);

  return (
    <div className="space-y-6">
      <div className="carte p-4">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium">Progression réglementaire</h3>
          <span className="chiffres text-sm">
            {globale.faits} / {globale.total}
            <span className="ml-2 font-semibold">{globale.pourcentage} %</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-creux">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${globale.pourcentage}%` }}
          />
        </div>
        {globale.sansObjet > 0 && (
          <p className="mt-1.5 text-xs text-attenue">
            {globale.sansObjet} ligne(s) marquée(s) sans objet, exclue(s) du calcul.
          </p>
        )}
      </div>

      {[...parReferentiel.entries()].map(([cle, items]) => {
        const ref = referentiel(cle);
        const prog = progression(items);

        const parPhase = new Map<Phase, ChecklistItem[]>();
        for (const i of items) {
          const p = i.phase as Phase;
          parPhase.set(p, [...(parPhase.get(p) ?? []), i]);
        }

        return (
          <section key={cle} className="carte overflow-hidden">
            <header className="border-b border-ligne p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{ref?.nom ?? cle}</h3>
                  {ref?.resume && <p className="mt-1 text-sm text-attenue">{ref.resume}</p>}
                </div>
                <span className="chiffres shrink-0 text-sm text-attenue">
                  {prog.faits} / {prog.total}
                </span>
              </div>

              {ref && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-attenue">
                  <span>Contenu vérifié le {formaterDate(dateIso(ref.verifieLe))}</span>
                  {ref.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {s.libelle} ↗
                    </a>
                  ))}
                  <form action={actualiserReferentiel}>
                    <input type="hidden" name="etudeId" value={etudeId} />
                    <input type="hidden" name="referentiel" value={cle} />
                    <button
                      type="submit"
                      title="Recharger les libellés depuis le référentiel"
                      className="underline-offset-2 transition hover:text-encre hover:underline"
                    >
                      Actualiser depuis le référentiel
                    </button>
                  </form>
                </div>
              )}
            </header>

            {ORDRE_PHASES.filter((p) => parPhase.has(p)).map((phase) => (
              <div key={phase}>
                <h4 className="border-b border-ligne bg-surface/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-attenue">
                  {LIBELLES_PHASE[phase]}
                </h4>
                <ul className="divide-y divide-ligne">
                  {parPhase.get(phase)!.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-3 px-4 py-3 ${
                        item.sansObjet ? "opacity-50" : ""
                      }`}
                    >
                      <form action={basculerChecklist} className="pt-0.5">
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          aria-label={item.fait ? "Décocher" : "Marquer comme fait"}
                          className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition
                                      ${
                                        item.fait
                                          ? "border-reussite bg-reussite text-relief"
                                          : "border-ligne hover:border-accent"
                                      }`}
                        >
                          {item.fait ? "✓" : ""}
                        </button>
                      </form>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            item.fait ? "text-attenue line-through" : "font-medium"
                          }`}
                        >
                          {item.titre}
                          {!item.obligatoire && (
                            <span className="ml-2 etiquette bg-creux text-attenue">
                              recommandé
                            </span>
                          )}
                        </p>

                        {item.description && (
                          <p className="mt-1 text-xs leading-relaxed text-attenue">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-attenue">
                          {item.reference && (
                            <span className="rounded bg-creux px-1.5 py-0.5 font-medium">
                              {item.reference}
                            </span>
                          )}
                          {item.fait && item.faitLe && (
                            <span>Fait le {formaterDate(item.faitLe)}</span>
                          )}
                          <form action={basculerSansObjet}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="underline-offset-2 transition hover:text-encre hover:underline"
                            >
                              {item.sansObjet ? "Rendre applicable" : "Sans objet"}
                            </button>
                          </form>
                        </div>

                        <NoteChecklist id={item.id} noteInitiale={item.notes ?? ""} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      <p className="rounded-lg bg-attention-voile/50 p-3 text-xs leading-relaxed text-attenue">
        <strong>⚠️ {AVERTISSEMENT}</strong>
      </p>
    </div>
  );
}

/** "2026-08-04" -> secondes Unix, pour réutiliser le formatage de dates. */
function dateIso(valeur: string): number {
  const [a, m, j] = valeur.split("-").map(Number);
  return Math.floor(new Date(a, m - 1, j).getTime() / 1000);
}
