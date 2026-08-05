import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vigie — Gestion de projet en recherche clinique",
  description:
    "Vigie est un outil de gestion de projet destiné aux équipes de recherche clinique hospitalière : suivi des études et des missions, checklists réglementaires (RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL), archivage documentaire TMF, base de connaissance et suivi du temps.",
};

const fonctions = [
  {
    titre: "Études",
    texte:
      "Un dossier par étude clinique, regroupant les informations qui servent au quotidien : acronyme, promoteur, investigateur principal, numéro ID-RCB, numéro CTIS, référence du comité de protection des personnes, centre investigateur et calendrier prévisionnel. Chaque étude devient le point d'entrée vers ses missions, ses documents et sa checklist réglementaire.",
  },
  {
    titre: "Checklists réglementaires",
    texte:
      "Les obligations applicables à une étude dépendent du cadre dans lequel elle s'inscrit. Vigie génère automatiquement la checklist correspondante lorsque le cadre est coché : recherche impliquant la personne humaine de catégorie 1, 2 ou 3 au sens de la loi Jardé, règlement (UE) n° 536/2014 relatif aux essais cliniques de médicaments, règlement (UE) 2017/745 relatif aux dispositifs médicaux, règlement (UE) 2017/746 relatif aux dispositifs médicaux de diagnostic in vitro, bonnes pratiques cliniques ICH E6(R3), méthodologies de référence de la CNIL, et obligations de clôture et d'archivage.",
  },
  {
    titre: "Missions",
    texte:
      "Le suivi opérationnel de ce qu'il reste à faire, en vue tableau, groupé par statut ou par échéance. Les missions se filtrent par étude, par statut et par recherche textuelle, se commentent, et s'exportent au format Excel pour être partagées ou présentées en réunion d'équipe.",
  },
  {
    titre: "Documents",
    texte:
      "Le dépôt et le classement des documents d'étude selon les catégories d'un Trial Master File : protocole et amendements, brochure investigateur, autorisations réglementaires, avis du comité de protection des personnes, conventions, notes d'information et formulaires de consentement, documents de monitorage. Chaque document conserve sa version et sa date, et l'ensemble reste consultable par recherche.",
  },
  {
    titre: "Base de connaissance",
    texte:
      "Les questions qui reviennent — d'un centre investigateur, d'un attaché de recherche clinique, d'un nouvel arrivant dans l'équipe — trouvent une réponse écrite une fois pour toutes, classée par thème, générale ou propre à une étude donnée.",
  },
  {
    titre: "Pages de travail",
    texte:
      "Un éditeur de texte riche, dans l'esprit des outils de prise de notes structurée : titres, listes, tableaux, images. Les pages sont rattachées à une étude et enregistrées automatiquement, pour les comptes rendus de visite, les procédures internes ou les notes de suivi.",
  },
  {
    titre: "Suivi du temps",
    texte:
      "Un chronomètre déclenché en un clic ou une saisie manuelle acceptant les formats usuels (1h30, 1:30, 90min, 1,5), avec export Excel valorisé — utile pour la refacturation d'un temps d'attaché de recherche clinique ou de technicien d'étude clinique à un promoteur industriel.",
  },
];

const referentiels = [
  {
    nom: "Loi Jardé — RIPH 1, 2 et 3",
    detail:
      "Recherches impliquant la personne humaine, articles L.1121-1 et suivants du code de la santé publique. Les obligations diffèrent selon la catégorie : interventionnelle, interventionnelle à risques et contraintes minimes, ou non interventionnelle.",
  },
  {
    nom: "Règlement (UE) n° 536/2014",
    detail:
      "Essais cliniques de médicaments à usage humain, avec dépôt et suivi via le portail CTIS, et les délais d'évaluation associés.",
  },
  {
    nom: "Règlement (UE) 2017/745 — MDR",
    detail:
      "Investigations cliniques portant sur les dispositifs médicaux.",
  },
  {
    nom: "Règlement (UE) 2017/746 — IVDR",
    detail:
      "Études des performances des dispositifs médicaux de diagnostic in vitro.",
  },
  {
    nom: "ICH E6(R3) — bonnes pratiques cliniques",
    detail:
      "Principes et Annexe 1 applicables depuis le 23 juillet 2025 ; l'Annexe 2, consacrée aux essais décentralisés et pragmatiques, entre en vigueur le 15 janvier 2027.",
  },
  {
    nom: "CNIL — méthodologies de référence",
    detail:
      "Protection des données personnelles dans la recherche en santé. Les MR-001 et MR-003 refondues sont en vigueur depuis le 23 mai 2026.",
  },
  {
    nom: "Clôture et archivage",
    detail:
      "Obligations de fin d'étude : rapport final, conservation des données sources et durée légale d'archivage.",
  },
];

export default function PagePresentation() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm">
              📁
            </span>
            <span className="font-semibold">Vigie</span>
          </div>
          <Link href="/connexion" className="bouton-discret">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <section>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            La gestion de projet en recherche clinique, à un seul endroit
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Vigie rassemble le suivi des études, les missions de l&apos;équipe,
            les obligations réglementaires, les documents et le temps passé —
            sans dispersion entre un tableur, une boîte mail et un dossier
            partagé.
          </p>
          <div className="mt-8">
            <Link href="/connexion" className="bouton">
              Accéder à l&apos;application
            </Link>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">À qui cet outil s&apos;adresse</h2>
          <p className="mt-4 text-muted">
            Vigie a été conçu pour les personnes qui font vivre les études au
            quotidien dans un établissement de santé : chefs de projet,
            attachés de recherche clinique, techniciens d&apos;étude clinique,
            data managers et coordinateurs de recherche. Le vocabulaire, les
            écrans et les checklists reprennent ceux du métier — les
            référentiels, les phases d&apos;une étude, les catégories
            documentaires d&apos;un Trial Master File — plutôt qu&apos;un
            modèle de gestion de projet générique qu&apos;il faudrait plier à
            la recherche clinique.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Ce que fait Vigie</h2>
          <div className="mt-8 space-y-8">
            {fonctions.map((f) => (
              <article key={f.titre}>
                <h3 className="font-semibold">{f.titre}</h3>
                <p className="mt-2 text-muted">{f.texte}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">
            Les référentiels réglementaires couverts
          </h2>
          <p className="mt-4 text-muted">
            Chaque ligne d&apos;une checklist porte sa référence réglementaire,
            peut être cochée, annotée, ou marquée « sans objet » — auquel cas
            elle sort du calcul de progression. Les lignes sont regroupées par
            phase : conception, soumission, mise en place, conduite, clôture.
          </p>
          <dl className="mt-8 space-y-6">
            {referentiels.map((r) => (
              <div key={r.nom}>
                <dt className="font-semibold">{r.nom}</dt>
                <dd className="mt-1 text-muted">{r.detail}</dd>
              </div>
            ))}
          </dl>
          <div className="carte mt-8 p-5 text-sm text-muted">
            <p>
              <strong className="text-ink">
                Ces checklists sont une aide au travail, pas un avis
                réglementaire.
              </strong>{" "}
              Les textes évoluent. Chaque référentiel affiche la date à
              laquelle son contenu a été vérifié ainsi que des liens vers les
              sources officielles ; il revient à chaque équipe de vérifier la
              version en vigueur auprès de l&apos;ANSM, du comité de protection
              des personnes, de la CNIL ou de l&apos;EMA.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Hébergement et données</h2>
          <p className="mt-4 text-muted">
            L&apos;application est auto-hébergée : elle s&apos;installe sur le
            serveur de l&apos;équipe qui l&apos;utilise, et les données ne
            transitent par aucun service tiers. Les documents déposés et la
            base de données vivent dans un unique dossier, ce qui rend la
            sauvegarde et la restauration simples à mettre en place. L&apos;accès
            se fait par mot de passe, sur une connexion chiffrée.
          </p>
          <p className="mt-4 text-muted">
            L&apos;outil repose exclusivement sur des briques logicielles sous
            licence libre — MIT, MPL-2.0 et Apache-2.0 — dont les versions sont
            figées. Il n&apos;y a ni abonnement, ni dépendance à un éditeur qui
            pourrait en changer les conditions.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Accès</h2>
          <p className="mt-4 text-muted">
            Vigie est un outil de travail à accès restreint. La consultation
            des études, des missions et des documents nécessite une
            authentification.
          </p>
          <div className="mt-6">
            <Link href="/connexion" className="bouton">
              Se connecter
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-muted">
          Vigie — outil de gestion de projet pour la recherche clinique.
        </div>
      </footer>
    </div>
  );
}
