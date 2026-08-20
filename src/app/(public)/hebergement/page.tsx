import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hébergement — Vigie, application auto-hébergée",
  description:
    "Vigie s'installe sur le serveur de l'établissement : Union européenne, HTTPS, sauvegarde d'un répertoire, licences libres, pas de nuage éditeur obligatoire.",
  alternates: { canonical: "/hebergement" },
};

export default function PageHebergement() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Données</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Hébergement local
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie est conçu pour tourner chez vous. L&apos;établissement fournit le
          serveur, le nom d&apos;hôte, le certificat, les sauvegardes. Il n&apos;y a
          pas de plateforme SaaS obligatoire, pas de télémétrie vers un éditeur,
          pas de bascule d&apos;abonnement. C&apos;est un choix d&apos;architecture,
          expliqué plus longuement dans l&apos;article{" "}
          <Link
            href="/actualites/auto-hebergement-a-l-hopital"
            className="text-accent hover:underline"
          >
            Auto-héberger un outil de recherche clinique à l&apos;hôpital
          </Link>
          .
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Ce qui tourne
        </h2>
        <p>
          Un service web (Next.js), une base SQLite, un répertoire de fichiers
          déposés (TMF), un reverse proxy qui termine TLS (souvent Caddy). La
          base et les fichiers tiennent dans un volume unique, ce qui simplifie
          la copie de sauvegarde. Une sauvegarde n&apos;a de valeur que si une
          restauration a été testée.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Localisation
        </h2>
        <p>
          Le site et l&apos;application sont hébergés sur le serveur de cette
          installation, dans un centre de données ou une salle machine choisie
          par l&apos;établissement. L&apos;intention de conception est un
          hébergement dans l&apos;Union européenne. Vérifiez l&apos;implantation
          réelle auprès de votre informatique : cette page ne peut pas affirmer
          le lieu physique à la place du contrat d&apos;hébergement.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Accès réseau et filtres
        </h2>
        <p>
          Depuis un poste de bureau, un filtre d&apos;entreprise (catégorie web,
          « trop peu de contenu », site non classé) peut bloquer l&apos;URL. Le
          site public — présentation, articles, glossaire, mentions — existe
          aussi pour fournir un volume de texte professionnel identifiable. Le{" "}
          <Link href="/plan-du-site" className="text-accent hover:underline">
            plan du site
          </Link>{" "}
          et le fichier{" "}
          <Link href="/sitemap.xml" className="text-accent hover:underline">
            sitemap.xml
          </Link>{" "}
          listent les pages. L&apos;exception d&apos;URL, si elle reste
          nécessaire, est une décision de l&apos;établissement.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Licences</h2>
        <p>
          Next.js, React, Tailwind CSS, ExcelJS et SQLite sont sous licence MIT ;
          BlockNote sous MPL 2.0 ; Drizzle et Caddy sous Apache 2.0. Ces licences
          sont irrévocables pour les versions utilisées. Voir les{" "}
          <Link href="/mentions-legales" className="text-accent hover:underline">
            mentions légales
          </Link>
          .
        </p>
        <p>
          Pour les mesures applicatives (mots de passe, rôles, journal), voir{" "}
          <Link href="/securite" className="text-accent hover:underline">
            Sécurité
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
