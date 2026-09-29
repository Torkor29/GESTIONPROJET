import type { Metadata } from "next";
import Link from "next/link";
import { NOM_PRODUIT } from "@/lib/site";

export const metadata: Metadata = {
  title: `Mentions légales — ${NOM_PRODUIT}`,
  description:
    "Mentions légales du site Vigie Clinique : éditeur, hébergement, propriété intellectuelle, licences des briques logicielles et conditions d'accès à l'espace de travail.",
  alternates: { canonical: "/mentions-legales" },
};

/**
 * L'identité de l'éditeur dépend de qui installe l'outil : elle se renseigne
 * par variables d'environnement plutôt que d'être écrite en dur, pour qu'une
 * autre équipe qui déploie Vigie Clinique n'ait pas à modifier le code.
 */
const EDITEUR = process.env.EDITEUR ?? null;
const EDITEUR_CONTACT = process.env.EDITEUR_CONTACT ?? null;

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-titre text-2xl font-bold">{titre}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-attenue">{children}</div>
    </section>
  );
}

export default function PageMentionsLegales() {
  return (
    <div className="px-5 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="sur-titre">Informations légales</p>
        <h1 className="mt-4 font-titre text-[32px] leading-[1.2] tracking-[-0.02em] sm:text-[48px]">Mentions légales</h1>

        <Section titre="Éditeur du site">
          {EDITEUR ? (
            <p>
              {EDITEUR}
              {EDITEUR_CONTACT && (
                <>
                  {" — "}
                  {EDITEUR_CONTACT}
                </>
              )}
            </p>
          ) : (
            <p>
              Ce site présente {NOM_PRODUIT}, un espace de travail pour la
              recherche clinique, installé et exploité par l&apos;équipe qui
              l&apos;héberge. L&apos;identité de l&apos;éditeur de cette
              installation se renseigne à la configuration du serveur.
            </p>
          )}
          <p>
            {NOM_PRODUIT} n&apos;est pas un service commercial : il n&apos;y a ni
            abonnement, ni compte à ouvrir chez un éditeur, ni collecte à des
            fins publicitaires ou statistiques.
          </p>
        </Section>

        <Section titre="Hébergement">
          <p>
            Le site et l&apos;application sont hébergés sur un serveur dédié à
            cette installation, dans un centre de données situé dans
            l&apos;Union européenne. Les échanges avec le navigateur sont
            chiffrés par HTTPS, le certificat étant obtenu et renouvelé
            automatiquement.
          </p>
        </Section>

        <Section titre="Accès à l'espace de travail">
          <p>
            Les pages publiques — présentation, référentiels réglementaires,
            confidentialité et hébergement, présentes mentions — sont
            librement consultables. Tout le reste demande un compte : les
            études, les missions, les documents et les indicateurs ne sont
            accessibles qu&apos;aux personnes autorisées, et uniquement pour
            les études qui leur ont été ouvertes.
          </p>
          <p>
            Un compte se crée sur le site, ou par invitation nominative remise
            par une personne déjà autorisée.
          </p>
        </Section>

        <Section titre="Données personnelles">
          <p>
            Le fonctionnement de l&apos;application ne repose sur aucun traceur
            publicitaire ni outil de mesure d&apos;audience tiers. Le seul
            témoin de connexion déposé est celui qui maintient la session
            ouverte après authentification ; il est strictement nécessaire au
            service et disparaît à la déconnexion.
          </p>
          <p>
            Le détail de ce que l&apos;application enregistre, de ce
            qu&apos;elle n&apos;a pas vocation à recevoir et de la façon dont
            les accès sont cloisonnés figure sur la page{" "}
            <Link href="/donnees" className="text-accent hover:underline">
              Confidentialité et hébergement
            </Link>
            .
          </p>
        </Section>

        <Section titre="Propriété intellectuelle et licences">
          <p>
            {NOM_PRODUIT} s&apos;appuie sur des briques sous licence libre
            irrévocable : Next.js, React, Tailwind CSS, ExcelJS et SQLite sous
            licence MIT, l&apos;éditeur de texte riche BlockNote sous licence
            MPL 2.0, l&apos;ORM Drizzle et le serveur web Caddy sous licence
            Apache 2.0. Les polices de caractères employées sont diffusées sous
            SIL Open Font License.
          </p>
          <p>
            Les contenus réglementaires publiés sur ce site renvoient à leurs
            sources officielles : ANSM, Légifrance, EUR-Lex, CNIL, ICH, EMA. Ils
            constituent une aide au travail et non un avis réglementaire.
          </p>
        </Section>

        <Section titre="Responsabilité">
          <p>
            Les checklists et référentiels proposés par l&apos;application sont
            fournis à titre d&apos;aide à l&apos;organisation. Les textes
            évoluent : chaque référentiel porte la date à laquelle son contenu a
            été vérifié, et il appartient à chaque équipe de s&apos;assurer de la
            version en vigueur auprès des autorités compétentes avant toute
            décision.
          </p>
        </Section>
      </div>
    </div>
  );
}
