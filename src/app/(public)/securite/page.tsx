import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sécurité de l'instance — Vigie",
  description:
    "Mesures de sécurité de Vigie : comptes nominatifs, mot de passe haché scrypt, cookie de session, HTTPS, permissions serveur, journal d'audit, pas de données nominatives de participants.",
  alternates: { canonical: "/securite" },
};

export default function PageSecurite() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Données</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Sécurité de l&apos;instance
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Cette page complète{" "}
          <Link href="/donnees" className="text-accent hover:underline">
            Données et sécurité
          </Link>{" "}
          en détaillant les mécanismes techniques. Elle n&apos;est pas une
          certification, ni un rapport d&apos;audit, ni une analyse de risques
          ISO 27001. L&apos;établissement qui héberge l&apos;outil reste
          responsable du durcissement du serveur (pare-feu, mises à jour du
          système, sauvegardes testées).
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Comptes</h2>
        <p>
          Chaque personne a un compte. Le mot de passe n&apos;est jamais stocké
          en clair : il est dérivé avec scrypt et un sel propre au compte. Les
          invitations sont des liens à usage unique, d&apos;une durée limitée.
          Un compte désactivé perd l&apos;accès immédiatement, sans attendre la
          fin du cookie.
        </p>
        <p>
          La session repose sur un cookie HttpOnly, transmis en HTTPS. Il n&apos;y
          a pas d&apos;authentification unique imposée : si l&apos;établissement
          veut un SSO, c&apos;est un projet d&apos;intégration à part, qui n&apos;est
          pas décrit ici comme déjà livré.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Autorisations
        </h2>
        <p>
          Les rôles (chef de projet, data manager, ARC, investigateur, lecture
          seule, super-administrateur) sont vérifiés dans les actions serveur.
          Une étude, un document, une query ne s&apos;ouvrent que si le compte y
          a droit. La recherche globale respecte le même périmètre.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Journal</h2>
        <p>
          Les modifications notables (queries, rôles, objets d&apos;étude) laissent
          une trace : qui, quand, quoi. Ce journal sert l&apos;audit interne. Il
          ne suffit pas, à lui seul, à revendiquer une conformité 21 CFR Part 11
          ou une signature électronique qualifiée.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Données de participants
        </h2>
        <p>
          L&apos;application n&apos;offre pas de champ « nom du patient ». Un
          Subject ID n&apos;est pas une garantie juridique d&apos;anonymat,
          surtout s&apos;il existe une table de correspondance au centre. Voir{" "}
          <Link
            href="/actualites/subject-id-et-rgpd"
            className="text-accent hover:underline"
          >
            Subject ID et RGPD
          </Link>
          .
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Ce que la sécurité ne couvre pas
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Un mot de passe collé dans un fil de discussion.</li>
          <li>Un export Excel envoyé à une messagerie personnelle.</li>
          <li>Un serveur jamais mis à jour, ou une sauvegarde jamais restaurée.</li>
          <li>Un compte « équipe » partagé à cinq personnes.</li>
        </ul>
        <p>
          L&apos;
          <Link href="/hebergement" className="text-accent hover:underline">
            hébergement
          </Link>{" "}
          et les{" "}
          <Link href="/mentions-legales" className="text-accent hover:underline">
            mentions légales
          </Link>{" "}
          précisent où tourne l&apos;instance.
        </p>
      </div>
    </article>
  );
}
