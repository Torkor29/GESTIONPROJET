import Link from "next/link";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { Marque } from "@/components/marque";
import FormulaireConnexion from "./formulaire";

export const dynamic = "force-dynamic";

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/bord");
  // Installation neuve : il n'y a encore personne, on va créer le compte.
  if (aucunCompte()) redirect("/inscription");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />

      <div className="relative w-full max-w-sm animate-apparait">
        <div className="text-center">
          <Link href="/" className="inline-flex" aria-label="Vigie Clinique — accueil">
            <Marque />
          </Link>
          <h1 className="mt-6 font-titre text-2xl font-bold">Connexion</h1>
          <p className="mt-1.5 text-sm text-attenue">
            Retrouvez votre espace de travail.
          </p>
        </div>

        <div className="mt-8">
          <FormulaireConnexion />
        </div>

        <p className="mt-6 text-center text-sm text-efface">
          <Link href="/" className="transition-colors hover:text-accent">
            Découvrir Vigie Clinique
          </Link>
        </p>
      </div>
    </main>
  );
}
