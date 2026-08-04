import { redirect } from "next/navigation";
import { estConnecte } from "@/lib/auth";
import FormulaireConnexion from "./formulaire";

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl">
            📁
          </div>
          <h1 className="text-xl font-semibold">Gestion de projet</h1>
          <p className="mt-1 text-sm text-muted">Suivi d&apos;études, de tâches et de temps</p>
        </div>
        <FormulaireConnexion />
      </div>
    </main>
  );
}
