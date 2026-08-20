import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fonctionnement — organisation d'une étude dans Vigie",
  description:
    "Comment Vigie organise une étude clinique : centres, sujets, visites, data management, monitoring, documents, tâches et reporting. Logiciel de gestion de projet pour la recherche clinique hospitalière.",
  alternates: { canonical: "/fonctionnement" },
};

export default function PageFonctionnement() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Produit</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">
        Comment une étude est suivie
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Une étude nouvellement créée n&apos;est pas une page blanche cassée.
          Elle affiche ce qu&apos;il reste à configurer : ajouter les centres,
          définir les visites, rattacher l&apos;équipe, déposer les documents.
          Chaque liste vide propose l&apos;action suivante. C&apos;est le même
          principe que le site public : montrer du contenu utile dès la première
          visite, plutôt qu&apos;un écran muet.
        </p>
        <h2 className="pt-2 font-titre text-2xl font-bold text-encre">Le fil</h2>
        <p>
          Étude → centres → sujets (Subject ID) → visites protocolaires → valeurs
          CRF (structure, pas saisie clinique) → contrôles → queries → monitoring
          → documents → tâches → jalons → indicateurs. Une query n&apos;existe
          pas dans un silo : elle a une étude, un centre, un sujet, parfois une
          visite et une variable.
        </p>
        <p>
          Ce fil est développé dans la page{" "}
          <Link href="/methodologie" className="text-accent hover:underline">
            Méthodologie
          </Link>{" "}
          et dans les{" "}
          <Link href="/guides" className="text-accent hover:underline">
            guides
          </Link>{" "}
          (démarrer une étude, ouvrir un centre, queries, visites ARC, TMF,
          CAPA, droits).
        </p>
        <h2 className="pt-2 font-titre text-2xl font-bold text-encre">Rôles</h2>
        <p>
          Chef de projet, data manager, ARC, investigateur, lecture seule. Les
          permissions sont appliquées sur le serveur. Un ARC ne peut pas
          administrer l&apos;instance. Un investigateur voit surtout ses
          patients, ses queries à répondre et ses documents. Le détail est dans{" "}
          <Link href="/equipe" className="text-accent hover:underline">
            Équipe et rôles
          </Link>{" "}
          et le guide{" "}
          <Link href="/guides/roles-et-droits" className="text-accent hover:underline">
            rôles et droits
          </Link>
          .
        </p>
        <h2 className="pt-2 font-titre text-2xl font-bold text-encre">Recherche</h2>
        <p>
          Ctrl+K ouvre la recherche globale : une étude par acronyme
          (CANNA-BICH), un sujet par Subject ID (SUBJ-00125), une query par
          identifiant (QUERY-0001). La recherche ne sort pas du périmètre des
          études auxquelles votre compte a été convié.
        </p>
        <h2 className="pt-2 font-titre text-2xl font-bold text-encre">
          Démonstration
        </h2>
        <p>
          L&apos;administration permet de charger un jeu fictif : études AURORA
          (oncologie) et CANNA-BICH (académique), centres, sujets anonymisés,
          queries, visites. Tout est préfixé [DÉMO] et réinitialisable. Cela
          sert à former, pas à communiquer un résultat médical. Voir l&apos;
          <Link href="/aide" className="text-accent hover:underline">
            aide
          </Link>{" "}
          et les{" "}
          <Link href="/cas-usage" className="text-accent hover:underline">
            cas d&apos;usage
          </Link>
          .
        </p>
        <p>
          <Link href="/comparatif" className="text-accent hover:underline">
            Ce que Vigie n&apos;est pas
          </Link>
          {" · "}
          <Link href="/connexion" className="text-accent hover:underline">
            Accéder à l&apos;application
          </Link>
        </p>
      </div>
    </article>
  );
}
