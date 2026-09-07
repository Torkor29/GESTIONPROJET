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
    <main className="page-publique relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />

      <div className="relative w-full max-w-sm animate-apparait">
        <div className="text-center">
          <Link href="/" className="inline-flex" aria-label="Vigie Clinique — accueil">
            <Marque />
          </Link>
          <h1 className="mt-8 font-titre text-[32px] tracking-[-0.02em]">Connexion</h1>
          <p className="mt-3 text-[14px] leading-[1.35] text-attenue">
            Retrouvez votre espace de travail.
          </p>
        </div>

        <div className="mt-8">
          <FormulaireConnexion />
        </div>

          <Link href="/" className="lien-fleche mt-8 justify-center text-efface">
            Découvrir Vigie Clinique
          </Link>
      </div>
    </main>
  );
}
