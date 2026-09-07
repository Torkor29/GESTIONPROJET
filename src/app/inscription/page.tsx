import Link from "next/link";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { Marque } from "@/components/marque";
import FormulaireInscription from "./formulaire";

export const dynamic = "force-dynamic";

export default async function PageInscription() {
  if (await estConnecte()) redirect("/bord");
  // Une fois le premier compte créé, cette page n'a plus lieu d'être.
  if (!aucunCompte()) redirect("/connexion");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />

      <div className="relative w-full max-w-md animate-apparait">
        <div className="text-center">
          <Link href="/" className="inline-flex" aria-label="Vigie Clinique — accueil">
            <Marque />
          </Link>
          <h1 className="mt-6 font-titre text-2xl font-bold">Créer le compte propriétaire</h1>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-attenue">
            C&apos;est le premier compte de cette installation. Les suivants se
            créeront sur invitation.
          </p>
        </div>

        <div className="mt-8">
          <FormulaireInscription />
        </div>
      </div>
    </main>
  );
}
