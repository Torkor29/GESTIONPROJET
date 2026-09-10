"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { enregistrerAccueil, type EtatAccueil } from "@/actions/accueil";
import { WIDGETS_ACCUEIL } from "@/lib/accueil";

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

function FormulaireWidgets({
  actifs,
  etat,
  action,
}: {
  actifs: string[];
  etat: EtatAccueil;
  action: (donnees: FormData) => void;
}) {
  const [coches, setCoches] = useState<string[]>(actifs);

  useEffect(() => {
    setCoches(actifs);
  }, [actifs]);

  function basculer(cle: string) {
    setCoches((deja) =>
      deja.includes(cle) ? deja.filter((c) => c !== cle) : [...deja, cle],
    );
  }

  return (
    <form action={action} className="space-y-3">
      <ul className="space-y-1.5">
        {WIDGETS_ACCUEIL.map((w) => (
          <li key={w.cle}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-1.5 hover:bg-creux/60">
              <input
                type="checkbox"
                name="widget"
                value={w.cle}
                checked={coches.includes(w.cle)}
                onChange={() => basculer(w.cle)}
                className="mt-1 h-4 w-4 accent-indigo-600"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{w.nom}</span>
                <span className="block text-xs text-attenue">{w.description}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {etat.message && (
        <p role="status" className="text-sm text-reussite">
          {etat.message}
        </p>
      )}
      <div className="flex justify-end pt-1">
        <BoutonEnregistrer />
      </div>
    </form>
  );
}

export default function PersonnaliserAccueil({
  actifs,
  compact = false,
}: {
  actifs: string[];
  compact?: boolean;
}) {
  const [etat, action] = useActionState(enregistrerAccueil, {});
  const [ouverte, setOuverte] = useState(false);
  const succesVu = useRef(0);

  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  if (!compact) {
    return <FormulaireWidgets actifs={actifs} etat={etat} action={action} />;
  }

  return (
    <>
      <button type="button" onClick={() => setOuverte(true)} className="bouton-discret">
        Personnaliser
      </button>
      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre="Personnaliser l'accueil"
      >
        <p className="mb-4 text-sm text-attenue">
          Cochez les vues à afficher. Chaque compte compose le sien.
        </p>
        {ouverte ? (
          <FormulaireWidgets key={actifs.join(",")} actifs={actifs} etat={etat} action={action} />
        ) : null}
      </Modale>
    </>
  );
}
