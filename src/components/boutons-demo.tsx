"use client";

import { useState, useTransition } from "react";
import { chargerDemoSiAbsent, rechargerDemo, retirerDemo } from "@/actions/administration";
import { COMPTES_DEMO, MOT_DE_PASSE_DEMO } from "@/lib/demo";

export default function BoutonsDemo() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="bouton"
          disabled={pending}
          onClick={() => start(async () => setMsg((await chargerDemoSiAbsent()).message))}
        >
          Charger le jeu de démonstration
        </button>
        <button
          type="button"
          className="bouton-discret"
          disabled={pending}
          onClick={() => start(async () => setMsg((await rechargerDemo()).message))}
        >
          Réinitialiser les données de démo
        </button>
        <button
          type="button"
          className="bouton-discret"
          disabled={pending}
          onClick={() => start(async () => setMsg((await retirerDemo()).message))}
        >
          Retirer la démo
        </button>
      </div>
      {msg && <p className="text-sm text-attenue">{msg}</p>}
      <div className="carte p-4 text-sm">
        <p className="font-semibold">Comptes de démonstration</p>
        <p className="mt-1 text-xs text-attenue">
          Mot de passe commun : <code className="font-mono">{MOT_DE_PASSE_DEMO}</code>
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          {COMPTES_DEMO.map((c) => (
            <li key={c.email}>
              <span className="font-medium">{c.nom}</span> · {c.role} · {c.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
