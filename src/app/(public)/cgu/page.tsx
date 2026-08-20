import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Vigie",
  description:
    "Conditions d'utilisation de Vigie : pages publiques consultables librement, application réservée aux comptes invités, usage professionnel, absence de service commercial, responsabilité des contenus d'étude.",
  alternates: { canonical: "/cgu" },
};

export default function PageCgu() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Juridique</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Conditions d&apos;utilisation
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Les présentes conditions décrivent l&apos;usage du site public et de
          l&apos;application Vigie telle qu&apos;installée par un établissement.
          Elles ne constituent pas un contrat commercial : il n&apos;y a ni
          abonnement vendu ici, ni boutique, ni compte client grand public.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Pages publiques
        </h2>
        <p>
          La présentation, les guides, les articles, le glossaire, les
          référentiels commentés et les mentions sont consultables sans compte.
          Vous pouvez les citer en indiquant la source. Les checklists ne
          doivent pas être présentées comme un avis juridique ou un document
          opposable à une autorité.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Application authentifiée
        </h2>
        <p>
          L&apos;accès aux études, documents, queries et indicateurs est réservé
          aux personnes invitées par l&apos;établissement. Chaque compte est
          nominatif. Partager un mot de passe, laisser une session ouverte sur un
          poste commun, ou extraire des fichiers hors des circuits prévus par
          l&apos;établissement, contrevient à un usage professionnel responsable.
        </p>
        <p>
          Les contenus déposés (documents TMF, commentaires de queries, écarts)
          appartiennent au responsable de l&apos;étude et à l&apos;établissement,
          selon les règles internes. Vigie est un support. Il n&apos;accorde
          aucune licence sur ces pièces à un tiers.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Données et interdits
        </h2>
        <p>
          Il est demandé de ne pas saisir de données de santé identifiante dans
          l&apos;outil (nom de participant, date de naissance, NIR, compte rendu
          médical). Cette consigne est rappelée dans{" "}
          <Link href="/donnees" className="text-accent hover:underline">
            Données et sécurité
          </Link>
          . Un Subject ID et des compteurs suffisent au pilotage.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Disponibilité et sauvegarde
        </h2>
        <p>
          L&apos;établissement qui héberge l&apos;instance est responsable de la
          disponibilité, des sauvegardes et des restaurations. Le logiciel ne
          promet pas un niveau de service public. Une maintenance peut rendre
          l&apos;application temporairement inaccessible.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Responsabilité
        </h2>
        <p>
          Les informations publiées sur le site public visent à expliquer un
          outil de gestion de projet. Elles peuvent contenir des approximations
          ou devenir inexactes après une évolution réglementaire. Toute décision
          (soumission, inclusion, déclaration) s&apos;appuie sur les textes
          officiels et sur les procédures de l&apos;établissement, pas sur une
          page de ce site.
        </p>
        <p>
          Voir aussi les{" "}
          <Link href="/mentions-legales" className="text-accent hover:underline">
            mentions légales
          </Link>
          , la{" "}
          <Link href="/confidentialite" className="text-accent hover:underline">
            confidentialité
          </Link>{" "}
          et l&apos;
          <Link href="/hebergement" className="text-accent hover:underline">
            hébergement
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
