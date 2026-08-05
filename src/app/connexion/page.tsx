import { redirect } from "next/navigation";
import { estConnecte } from "@/lib/auth";
import FormulaireConnexion from "./formulaire";

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/");

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between">
        <section className="max-w-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl">
            📁
          </div>
          <h1 className="text-2xl font-semibold">
            Gestion de projet en recherche clinique
          </h1>
          <p className="mt-2 text-muted">
            Outil professionnel de suivi d&apos;études cliniques, réservé aux
            personnes autorisées : missions, documents, checklists
            réglementaires et pages de travail par étude.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>• Un dossier par étude : promoteur, investigateur, ID-RCB, n° CTIS</li>
            <li>• Suivi des missions, groupées par statut ou par échéance, avec filtres et export Excel</li>
            <li>• Dépôt de documents classés selon les catégories d&apos;un TMF</li>
            <li>
              • Checklists réglementaires générées selon le cadre applicable :
              RIPH, règlement (UE) 536/2014, MDR, IVDR, ICH E6(R3), CNIL/RGPD
            </li>
            <li>• Base de connaissance et pages de travail façon Notion, par étude</li>
            <li>• Suivi du temps, chronomètre et export valorisé</li>
          </ul>
        </section>

        <div className="w-full max-w-sm shrink-0">
          <FormulaireConnexion />
        </div>
      </div>
    </main>
  );
}
