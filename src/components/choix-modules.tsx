"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerModules } from "@/actions/modules";
import { Icone } from "@/components/icones";
import { DOMAINES, MODULES, construit } from "@/lib/modules";

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export default function ChoixModules({ actifs }: { actifs: string[] }) {
  const [etat, action] = useActionState(enregistrerModules, {});
  // Piloté par l'état : React 19 réinitialise le formulaire après l'action,
  // ce qui ferait clignoter les cases vers leur valeur d'origine.
  const [coches, setCoches] = useState<Set<string>>(new Set(actifs));

  const basculer = (cle: string) =>
    setCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(cle)) suivant.delete(cle);
      else suivant.add(cle);
      return suivant;
    });

  const disponibles = MODULES.filter((m) => construit(m) && !m.socle).length;
  const actifsDisponibles = MODULES.filter(
    (m) => construit(m) && !m.socle && coches.has(m.cle),
  ).length;

  return (
    <form action={action} className="space-y-8">
      {DOMAINES.map((domaine) => {
        const duDomaine = MODULES.filter((m) => m.domaine === domaine);
        if (duDomaine.length === 0) return null;

        return (
          <section key={domaine}>
            <h2 className="sur-titre mb-3">{domaine}</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {duDomaine.map((m) => {
                const pret = construit(m);
                const actif = m.socle || coches.has(m.cle);
                const verrouille = Boolean(m.socle) || !pret;

                return (
                  <label
                    key={m.cle}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200
                      ${verrouille ? "cursor-default" : "cursor-pointer hover:border-ligne-forte"}
                      ${
                        actif && pret
                          ? "border-accent/40 bg-accent-voile/30"
                          : "border-ligne bg-relief"
                      }
                      ${!pret ? "opacity-60" : ""}`}
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
                        {!pret && (
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

      {/* Les modules cochés mais pas encore construits doivent quand même
          partir au serveur : sans cela, la sélection les perdrait à chaque
          enregistrement, et il faudrait les recocher à leur sortie. */}
      {[...coches]
        .filter((cle) => {
          const m = MODULES.find((x) => x.cle === cle);
          return m && !construit(m) && !m.socle;
        })
        .map((cle) => (
          <input key={cle} type="hidden" name="module" value={cle} />
        ))}

      {/* z-30 : le chronomètre flottant occupe le bas de l'écran en z-20, et
          passerait sinon par-dessus le bouton d'enregistrement. Sur cet écran,
          c'est l'enregistrement qui prime — le chronomètre continue de tourner
          et reste lisible dans le titre de l'onglet. */}
      <div className="sticky bottom-0 z-30 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-ligne bg-surface/95 px-1 py-4 backdrop-blur-md">
        <p className="text-sm text-attenue">
          <span className="chiffres font-semibold text-encre">
            {actifsDisponibles}/{disponibles}
          </span>{" "}
          module{disponibles > 1 ? "s" : ""} disponible
          {disponibles > 1 ? "s" : ""} activé{actifsDisponibles > 1 ? "s" : ""}
          {etat.message && <span className="ml-3 text-reussite">{etat.message}</span>}
        </p>
        <BoutonEnregistrer />
      </div>
    </form>
  );
}
