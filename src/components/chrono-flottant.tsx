"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { annulerChrono, arreterChrono } from "@/actions/temps";
import { formaterChrono } from "@/lib/format";
import type { Temps } from "@/db/schema";

type Chrono = {
  entree: Temps;
  etudeNom: string | null;
  etudeCouleur: string | null;
  tacheTitre: string | null;
} | null;

export default function ChronoFlottant({ chrono }: { chrono: Chrono }) {
  const debut = chrono?.entree.debut ?? null;
  const [ecoule, setEcoule] = useState(() =>
    debut ? Math.max(0, Math.floor(Date.now() / 1000) - debut) : 0,
  );

  useEffect(() => {
    if (!debut) return;
    // Recalculé depuis l'horloge à chaque tick : le compteur reste juste même
    // si l'onglet est resté en arrière-plan.
    const calculer = () => setEcoule(Math.max(0, Math.floor(Date.now() / 1000) - debut));
    calculer();
    const t = setInterval(calculer, 1000);
    return () => clearInterval(t);
  }, [debut]);

  // Le titre de l'onglet devient le compteur : lisible sans revenir sur la page.
  useEffect(() => {
    if (!debut) {
      document.title = "Gestion de projet";
      return;
    }
    document.title = `${formaterChrono(ecoule)} — Gestion de projet`;
  }, [debut, ecoule]);

  if (!chrono) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center p-4">
        <Link
          href="/temps"
          className="pointer-events-auto rounded-full border border-line bg-raised px-4 py-2.5 text-sm font-medium shadow-lg transition hover:border-accent/50 hover:text-accent"
        >
          ⏱ Démarrer un chronomètre
        </Link>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center p-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-line bg-raised py-2 pl-4 pr-2 shadow-lg">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full"
          style={{ backgroundColor: chrono.etudeCouleur ?? "#ef4444" }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">
            {chrono.etudeNom ?? "Sans étude"}
          </p>
          <p className="truncate text-xs leading-tight text-muted">
            {chrono.tacheTitre ?? chrono.entree.description ?? "En cours"}
          </p>
        </div>
        <span className="chiffres px-1 text-base font-semibold tabular-nums" aria-live="off">
          {formaterChrono(ecoule)}
        </span>
        <form action={arreterChrono}>
          <button type="submit" className="bouton rounded-full px-4 py-1.5">
            Arrêter
          </button>
        </form>
        <form action={annulerChrono}>
          <button
            type="submit"
            title="Annuler sans enregistrer"
            aria-label="Annuler sans enregistrer"
            className="rounded-full px-2 py-1.5 text-sm text-muted transition hover:text-red-500"
          >
            ✕
          </button>
        </form>
      </div>
    </div>
  );
}
