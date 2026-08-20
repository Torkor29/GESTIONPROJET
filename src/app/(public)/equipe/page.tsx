import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Équipe et rôles — Vigie",
  description:
    "Comment une unité de recherche clinique s'organise dans Vigie : super-administrateur, chef de projet, data manager, ARC, investigateur, lecture seule, invitations nominatives.",
  alternates: { canonical: "/equipe" },
};

export default function PageEquipe() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Organisation</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Une équipe nominative, pas un login partagé
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie n&apos;a pas de compte « secrétariat » ou « unité » à cinq
          personnes. Chaque utilisateur a un nom, une adresse professionnelle, un
          rôle, une session. C&apos;est la condition pour qu&apos;un journal
          d&apos;audit veuille dire quelque chose, et pour qu&apos;un
          investigateur ne voie pas le portefeuille entier de l&apos;établissement.
        </p>
        <p>
          Le premier compte, créé à l&apos;installation, est super-administrateur :
          il invite, désactive, charge éventuellement le jeu de démonstration,
          règle les paramètres d&apos;instance. Les comptes suivants arrivent par
          un lien d&apos;invitation, remis de la main à la main, valable quelques
          jours, à usage unique.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Rôles globaux
        </h2>
        <p>
          Le métier déclaré oriente la navigation (modules proposés) et les
          permissions serveur. On peut ensuite ouvrir une étude à quelqu&apos;un
          en lecture ou en écriture, indépendamment — dans les limites du rôle.
          Un ARC n&apos;administre pas l&apos;instance parce qu&apos;on lui a
          partagé une étude.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/metiers/chef-de-projet" className="text-accent hover:underline">
              Chef de projet
            </Link>{" "}
            — portefeuille, jalons, configuration.
          </li>
          <li>
            <Link href="/metiers/data-manager" className="text-accent hover:underline">
              Data manager
            </Link>{" "}
            — queries, revue, CRF, lock.
          </li>
          <li>
            <Link href="/metiers/arc" className="text-accent hover:underline">
              ARC
            </Link>{" "}
            — centres, visites de monitoring, écarts.
          </li>
          <li>
            <Link href="/metiers/tec" className="text-accent hover:underline">
              TEC
            </Link>{" "}
            et{" "}
            <Link href="/metiers/investigateur" className="text-accent hover:underline">
              investigateur
            </Link>{" "}
            — sujets du centre, réponses aux queries.
          </li>
          <li>Lecture seule — reporting, sans modification.</li>
        </ul>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Ce que « équipe » ne veut pas dire
        </h2>
        <p>
          Ce n&apos;est pas un organigramme RH, ni un trombinoscope, ni un
          réseau social interne. Les pages publiques n&apos;affichent aucun nom
          réel de professionnel de santé. Les comptes de démonstration
          (julia.martin@demo.vigie.local et les autres) sont fictifs, préfixés,
          destinés à la formation.
        </p>
        <p>
          Le détail des permissions se lit dans le guide{" "}
          <Link href="/guides/roles-et-droits" className="text-accent hover:underline">
            Rôles, invitations et droits d&apos;accès
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
