import Link from "next/link";
import { Marque } from "@/components/marque";

export function CadreCompte({
  children,
  largeur = "sm",
}: {
  children: React.ReactNode;
  largeur?: "sm" | "md";
}) {
  return (
    <main className="page-publique relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />
      <div
        className={`relative w-full animate-apparait ${largeur === "md" ? "max-w-md" : "max-w-sm"}`}
      >
        {children}
      </div>
    </main>
  );
}

export function EnTeteCompte({
  titre,
  intro,
}: {
  titre: string;
  intro?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <Link href="/" className="inline-flex" aria-label="Vigie Clinique — accueil">
        <Marque />
      </Link>
      <h1 className="mt-8 font-titre text-[32px] tracking-[-0.02em]">{titre}</h1>
      {intro ? (
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-[1.35] text-attenue">{intro}</p>
      ) : null}
    </div>
  );
}

export function LiensCompte({
  actuel,
}: {
  actuel: "connexion" | "inscription" | "oublie";
}) {
  const lien = (href: string, libelle: string) => (
    <Link href={href} className="lien-fleche justify-center text-efface">
      {libelle}
    </Link>
  );

  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label="Autres accès au compte">
      {actuel !== "connexion" ? lien("/connexion", "Se connecter") : null}
      {actuel !== "inscription" ? lien("/inscription", "Créer un compte") : null}
      {actuel !== "oublie" ? lien("/mot-de-passe-oublie", "Mot de passe oublié") : null}
      <Link href="/" className="lien-fleche justify-center text-efface">
        Découvrir Vigie Clinique
      </Link>
    </nav>
  );
}
