"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Icone, type NomIcone } from "@/components/icones";
import type { EtatModules } from "@/actions/modules";

export type ModuleChoix = {
  cle: string;
  nom: string;
  description: string;
  icone: NomIcone;
  domaine: string;
  pret: boolean;
  socle: boolean;
};

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

/**
 * Choix des modules.
 *
 * Les modules disponibles sont rangés par les mêmes rubriques que la barre
 * latérale : ce qu'on coche ici, on le retrouve au même endroit à gauche.
 * Les modules annoncés mais pas encore construits sont mis à part, repliés,
 * plutôt que mêlés en grisé aux modules utilisables.
 */
export default function ChoixModules({
  actifs,
  modules,
  domaines,
  rubriques,
  enregistrer,
}: {
  actifs: string[];
  modules: ModuleChoix[];
  domaines: string[];
  /** Rubriques de la barre latérale, dans l'ordre. */
  rubriques: { titre: string | null; cles: string[] }[];
  enregistrer: (precedent: EtatModules, donnees: FormData) => Promise<EtatModules>;
}) {
  const [etat, action] = useActionState(enregistrer, {});
  const [coches, setCoches] = useState<string[]>(actifs);

  const has = (cle: string) => coches.includes(cle);
  const basculer = (cle: string) =>
    setCoches((precedent) =>
      precedent.includes(cle) ? precedent.filter((c) => c !== cle) : [...precedent, cle],
    );

  const prets = modules.filter((m) => m.pret);
  const aVenir = modules.filter((m) => !m.pret);
  const disponibles = prets.filter((m) => !m.socle).length;
  const actifsDisponibles = prets.filter((m) => !m.socle && has(m.cle)).length;

  const ranges = new Set(rubriques.flatMap((r) => r.cles));
  const groupes = [
    ...rubriques.map((r) => ({
      titre: r.titre ?? "Accueil",
      modules: r.cles
        .map((cle) => prets.find((m) => m.cle === cle))
        .filter((m): m is ModuleChoix => m !== undefined),
    })),
    { titre: "Autres", modules: prets.filter((m) => !ranges.has(m.cle)) },
  ].filter((g) => g.modules.length > 0);

  return (
    <form action={action} className="space-y-6">
      {groupes.map((g) => (
        <section key={g.titre}>
          <h3 className="sur-titre mb-2">{g.titre}</h3>
          <ul className="divide-y divide-ligne overflow-hidden rounded-xl border border-ligne bg-relief">
            {g.modules.map((m) => {
              const actif = m.socle || has(m.cle);
              return (
                <li key={m.cle}>
                  <label
                    className={`flex items-center gap-3.5 px-4 py-3 ${m.socle ? "" : "cursor-pointer hover:bg-creux/50"}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        actif ? "bg-accent-voile text-accent-appuye" : "bg-creux text-efface"
                      }`}
                    >
                      <Icone nom={m.icone} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{m.nom}</span>
                        {m.socle && <span className="etiquette">Toujours actif</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-attenue">
                        {m.description}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      name="module"
                      value={m.cle}
                      checked={actif}
                      disabled={m.socle}
                      onChange={() => basculer(m.cle)}
                      aria-label={`${actif ? "Désactiver" : "Activer"} ${m.nom}`}
                      className="interrupteur"
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Les modules à venir déjà cochés restent cochés à l'enregistrement. */}
      {coches
        .filter((cle) => aVenir.some((m) => m.cle === cle))
        .map((cle) => (
          <input key={cle} type="hidden" name="module" value={cle} />
        ))}

      {aVenir.length > 0 && (
        <details className="group rounded-xl border border-dashed border-ligne-forte bg-relief/50">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-attenue hover:text-encre">
            <Icone nom="chevron" className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
            Bientôt dans Vigie
            <span className="etiquette">{aVenir.length} modules</span>
          </summary>
          <div className="grid gap-x-8 gap-y-5 border-t border-ligne px-4 py-4 sm:grid-cols-2">
            {domaines.map((domaine) => {
              const duDomaine = aVenir.filter((m) => m.domaine === domaine);
              if (duDomaine.length === 0) return null;
              return (
                <div key={domaine}>
                  <p className="sur-titre mb-1.5">{domaine}</p>
                  <ul className="space-y-1.5">
                    {duDomaine.map((m) => (
                      <li key={m.cle} className="flex gap-2.5 text-[13px]">
                        <Icone nom={m.icone} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-efface" />
                        <span>
                          <span className="font-medium text-encre">{m.nom}</span>
                          <span className="text-attenue"> — {m.description}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </details>
      )}

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-ligne bg-surface/95 px-1 py-3 backdrop-blur-md">
        <p className="text-sm text-attenue">
          <span className="chiffres font-semibold text-encre">
            {actifsDisponibles}/{disponibles}
          </span>{" "}
          module{disponibles > 1 ? "s" : ""} activé{actifsDisponibles > 1 ? "s" : ""}
          {etat?.message && <span className="ml-3 text-reussite">{etat.message}</span>}
        </p>
        <BoutonEnregistrer />
      </div>
    </form>
  );
}
