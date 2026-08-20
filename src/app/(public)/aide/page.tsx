import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aide — Vigie, gestion de projet en recherche clinique",
  description:
    "Aide à l'utilisation de Vigie : première connexion, invitation, jeu de démonstration, étude vide, queries, recherche Ctrl+K, états vides, filtre d'entreprise.",
  alternates: { canonical: "/aide" },
};

export default function PageAide() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Aide</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Prendre l&apos;outil en main</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Cette page est le mode d&apos;emploi court. Les procédures détaillées
          sont dans les{" "}
          <Link href="/guides" className="text-accent hover:underline">
            guides
          </Link>
          . Les questions courtes sont dans les{" "}
          <Link href="/questions-frequentes" className="text-accent hover:underline">
            questions fréquentes
          </Link>
          . Le vocabulaire est dans le{" "}
          <Link href="/glossaire" className="text-accent hover:underline">
            glossaire
          </Link>
          .
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Première connexion</h2>
        <p>
          À l&apos;installation, un premier compte se crée avec la clé
          d&apos;installation du serveur. Les comptes suivants passent par
          invitation. Le premier compte est super-administrateur de l&apos;instance.
          Il n&apos;y a pas d&apos;inscription ouverte sur internet : c&apos;est
          volontaire, pour ne pas exposer un suivi d&apos;études.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">
          Jeu de démonstration
        </h2>
        <p>
          Depuis Administration, vous pouvez charger un jeu fictif : études
          AURORA et CANNA-BICH, centres, sujets identifiés par Subject ID,
          queries, visites de monitoring, déviations. Les objets sont préfixés
          [DÉMO]. Vous pouvez le réinitialiser sans toucher à vos études réelles.
          Les adresses (julia.martin@demo.vigie.local et les autres) sont
          fictives.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Étude vide</h2>
        <p>
          Créer une étude sans y mettre tout de suite des patients ne bloque
          rien. Les écrans expliquent la suite : centres, calendrier de visites,
          équipe, documents. Si une liste vous paraît « cassée », lisez
          l&apos;état vide : il indique l&apos;action suivante, pas une erreur
          serveur.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Queries</h2>
        <p>
          Une query s&apos;ouvre, se répond, se rouvre, se résout puis se ferme.
          Chaque étape est historisée. Tant qu&apos;elle n&apos;est pas résolue
          ou fermée, elle compte dans les indicateurs du data manager. Le guide{" "}
          <Link href="/guides/queries" className="text-accent hover:underline">
            Ouvrir, répondre et fermer une query
          </Link>{" "}
          détaille les cinq états.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Recherche</h2>
        <p>
          Une fois connecté, Ctrl+K (ou Cmd+K) cherche une étude, un Subject ID,
          une query. Rien n&apos;apparaît hors de votre périmètre.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">
          Le site ne s&apos;ouvre pas au bureau
        </h2>
        <p>
          Certains filtres d&apos;entreprise classent une URL comme « trop peu de
          contenu » lorsqu&apos;ils ne voient qu&apos;un formulaire. Utilisez le{" "}
          <Link href="/plan-du-site" className="text-accent hover:underline">
            plan du site
          </Link>
          , les{" "}
          <Link href="/mentions-legales" className="text-accent hover:underline">
            mentions légales
          </Link>{" "}
          et le{" "}
          <Link href="/sitemap.xml" className="text-accent hover:underline">
            sitemap.xml
          </Link>{" "}
          pour montrer qu&apos;il s&apos;agit d&apos;un site professionnel
          d&apos;information. La page{" "}
          <Link href="/contact" className="text-accent hover:underline">
            Contact
          </Link>{" "}
          indique à qui parler dans l&apos;établissement.
        </p>
        <p>
          <Link href="/connexion" className="text-accent hover:underline">
            Se connecter
          </Link>
          {" · "}
          <Link href="/changelog" className="text-accent hover:underline">
            Journal des versions
          </Link>
        </p>
      </div>
    </article>
  );
}
