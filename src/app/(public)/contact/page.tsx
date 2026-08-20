import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Vigie, gestion de projet en recherche clinique",
  description:
    "Comment contacter l'équipe qui héberge Vigie dans votre établissement : administrateur d'instance, mentions légales, signalement d'un problème d'accès ou d'accessibilité.",
  alternates: { canonical: "/contact" },
};

const EDITEUR = process.env.EDITEUR ?? null;
const EDITEUR_CONTACT = process.env.EDITEUR_CONTACT ?? null;

export default function PageContact() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Établissement</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">Contact</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie n&apos;est pas un service commercial avec un standard national.
          Chaque installation appartient à l&apos;établissement qui l&apos;héberge.
          Les comptes, les études et les documents ne sont visibles que de cet
          établissement. Pour un problème d&apos;accès, d&apos;invitation ou de mot
          de passe, contactez la personne qui vous a ouvert le compte, ou
          l&apos;administrateur de l&apos;instance.
        </p>
        {EDITEUR ? (
          <p>
            Éditeur de cette installation : <strong className="text-encre">{EDITEUR}</strong>
            {EDITEUR_CONTACT ? (
              <>
                {" "}
                — {EDITEUR_CONTACT}
              </>
            ) : null}
            .
          </p>
        ) : (
          <p>
            L&apos;identité de l&apos;éditeur se renseigne à la configuration du
            serveur (variables d&apos;environnement). Tant qu&apos;elle n&apos;est
            pas renseignée, reportez-vous à votre direction de la recherche, à
            l&apos;unité de recherche clinique ou au service informatique qui a
            installé l&apos;outil. Le détail figure aussi sur les{" "}
            <Link href="/mentions-legales" className="text-accent hover:underline">
              mentions légales
            </Link>
            .
          </p>
        )}
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Ce que nous ne pouvons pas faire depuis cette page
        </h2>
        <p>
          Il n&apos;y a pas de formulaire public d&apos;ouverture de compte, ni de
          chat. La création de compte se fait par invitation nominative, pour
          éviter qu&apos;un inconnu n&apos;entre dans un suivi d&apos;études. Il
          n&apos;y a pas non plus de support éditeur central : les données restent
          chez vous.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Signalements utiles
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Impossible d&apos;ouvrir le site depuis le réseau de l&apos;établissement :
            montrer le{" "}
            <Link href="/plan-du-site" className="text-accent hover:underline">
              plan du site
            </Link>{" "}
            et cette page au filtrage web (souvent un classement « trop peu de
            contenu »).
          </li>
          <li>
            Problème d&apos;accessibilité : voir la page{" "}
            <Link href="/accessibilite" className="text-accent hover:underline">
              Accessibilité
            </Link>
            .
          </li>
          <li>
            Question sur les données :{" "}
            <Link href="/donnees" className="text-accent hover:underline">
              Données et sécurité
            </Link>{" "}
            et{" "}
            <Link href="/confidentialite" className="text-accent hover:underline">
              Confidentialité
            </Link>
            .
          </li>
        </ul>
        <p>
          Pour comprendre l&apos;outil avant de demander un compte, commencez par{" "}
          <Link href="/a-propos" className="text-accent hover:underline">
            À propos
          </Link>
          , le{" "}
          <Link href="/fonctionnement" className="text-accent hover:underline">
            fonctionnement
          </Link>{" "}
          et les{" "}
          <Link href="/metiers" className="text-accent hover:underline">
            métiers
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
