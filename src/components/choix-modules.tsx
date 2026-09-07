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

export default function ChoixModules({
  actifs,
  modules,
  domaines,
  enregistrer,
}: {
  actifs: string[];
  modules: ModuleChoix[];
  domaines: string[];
  enregistrer: (precedent: EtatModules, donnees: FormData) => Promise<EtatModules>;
}) {
  const [etat, action] = useActionState(enregistrer, {});
  const [coches, setCoches] = useState<string[]>(actifs);

  const has = (cle: string) => coches.includes(cle);

  const basculer = (cle: string) =>
    setCoches((precedent) =>
      precedent.includes(cle) ? precedent.filter((c) => c !== cle) : [...precedent, cle],
    );

  const disponibles = modules.filter((m) => m.pret && !m.socle).length;
  const actifsDisponibles = modules.filter((m) => m.pret && !m.socle && has(m.cle)).length;

  return (
    <form action={action} className="space-y-8">
      {domaines.map((domaine) => {
        const duDomaine = modules.filter((m) => m.domaine === domaine);
        if (duDomaine.length === 0) return null;

        return (
          <section key={domaine}>
            <h2 className="sur-titre mb-3">{domaine}</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {duDomaine.map((m) => {
                const actif = m.socle || has(m.cle);
                const verrouille = m.socle || !m.pret;

                return (
                  <label
                    key={m.cle}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200
                      ${verrouille ? "cursor-default" : "cursor-pointer hover:border-ligne-forte"}
                      ${
                        actif && m.pret
                          ? "border-accent/40 bg-accent-voile/30"
                          : "border-ligne bg-relief"
                      }
                      ${!m.pret ? "opacity-60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      name="module"
                      value={m.cle}
                      checked={actif}
                      disabled={verrouille}
                      onChange={() => basculer(m.cle)}
                      className="mt-1 h-4 w-4 shrink-0 accent-accent"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Icone nom={m.icone} className="h-4 w-4 shrink-0 text-accent" />
                        <span className="font-titre text-sm font-bold">{m.nom}</span>
                        {m.socle && (
                          <span className="etiquette bg-creux text-attenue">Toujours actif</span>
                        )}
                        {!m.pret && (
                          <span className="etiquette bg-attention-voile text-attention">
                            À venir
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-attenue">
                        {m.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}

      {coches
        .filter((cle) => {
          const m = modules.find((x) => x.cle === cle);
          return m && !m.pret && !m.socle;
        })
        .map((cle) => (
          <input key={cle} type="hidden" name="module" value={cle} />
        ))}

      <div className="sticky bottom-0 z-30 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-ligne bg-surface/95 px-1 py-4 backdrop-blur-md">
        <p className="text-sm text-attenue">
          <span className="chiffres font-semibold text-encre">
            {actifsDisponibles}/{disponibles}
          </span>{" "}
          module{disponibles > 1 ? "s" : ""} disponible
          {disponibles > 1 ? "s" : ""} activé{actifsDisponibles > 1 ? "s" : ""}
          {etat?.message && <span className="ml-3 text-reussite">{etat.message}</span>}
        </p>
        <BoutonEnregistrer />
      </div>
    </form>
  );
}
