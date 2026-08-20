import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aide — Vigie, gestion de projet en recherche clinique",
  description:
    "Aide à l'utilisation de Vigie : créer une étude, charger les données de démonstration, suivre les queries, planifier le monitoring, comprendre les états vides.",
  alternates: { canonical: "/aide" },
};

export default function PageAide() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Aide</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Prendre l&apos;outil en main</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <h2 className="font-titre text-2xl font-bold text-encre">Première connexion</h2>
        <p>
          À l&apos;installation, un premier compte se crée avec la clé d&apos;installation
          du serveur. Les comptes suivants passent par invitation. Le premier
          compte est super-administrateur de l&apos;instance.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Jeu de démonstration</h2>
        <p>
          Depuis Administration, vous pouvez charger un jeu fictif : études
          AURORA et CANNA-BICH, centres, sujets anonymisés, queries, visites de
          monitoring, déviations. Les objets sont préfixés [DÉMO]. Vous pouvez
          le réinitialiser sans toucher à vos études réelles.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Étude vide</h2>
        <p>
          Créer une étude sans y mettre tout de suite des patients ne bloque
          rien. Les écrans expliquent la suite : centres, calendrier de visites,
          équipe, documents.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Queries</h2>
        <p>
          Une query s&apos;ouvre, se répond, se rouvre, se résout puis se ferme. Chaque
          étape est historisée. Tant qu&apos;elle n&apos;est pas résolue ou fermée, elle
          compte dans les indicateurs du Data Manager.
        </p>
        <p>
          <Link href="/connexion" className="text-accent">
            Se connecter
          </Link>
        </p>
      </div>
    </article>
  );
}
