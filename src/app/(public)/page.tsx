import type { Metadata } from "next";
import Link from "next/link";
import { Icone, type NomIcone } from "@/components/icones";
import { Apparition } from "@/components/public/apparition";
import { ApercuProduit } from "@/components/public/apercu-produit";
import { DESCRIPTION_SEO, NOM_PRODUIT } from "@/lib/site";

export const metadata: Metadata = {
  title: `${NOM_PRODUIT} — Espace de travail de la recherche clinique`,
  description: DESCRIPTION_SEO,
};

const metiers: {
  role: string;
  nom: string;
  quotidien: string;
  apporte: string[];
}[] = [
  {
    role: "ARC",
    nom: "Attaché de recherche clinique",
    quotidien:
      "Vos visites, vos écarts et le fil d'une étude, sans le reconstruire à chaque fois.",
    apporte: [
      "Visites de monitorage planifiées et réalisées, par centre",
      "Écarts constatés et actions correctives jusqu'à leur clôture",
      "Portefeuille des études que vous suivez",
    ],
  },
  {
    role: "TEC",
    nom: "Technicien d'étude clinique",
    quotidien:
      "Le dossier de l'étude, les missions du jour et les pièces à classer, au même endroit.",
    apporte: [
      "Dossier de chaque étude : identifiants, calendrier, statut",
      "Missions et échéances, filtrables et exportables",
      "Documents du TMF et temps passé, rattachés à l'étude",
    ],
  },
  {
    role: "CP",
    nom: "Chef de projet",
    quotidien:
      "Une vue de votre portefeuille, de la charge de l'équipe et des conventions en cours.",
    apporte: [
      "État de chaque étude en une ligne, et charge de chacun",
      "Conventions, avenants, montants perçus et reste à percevoir",
      "Indicateurs d'activité issus du travail déjà saisi",
    ],
  },
];

const piliers: { icone: NomIcone; titre: string; texte: string }[] = [
  {
    icone: "dossier",
    titre: "Centraliser l'activité",
    texte:
      "Chaque étude a son dossier. Missions, documents, obligations et temps passé s'y rattachent, au lieu de vivre dans des fichiers séparés.",
  },
  {
    icone: "drapeau",
    titre: "Suivre ce qui est en cours",
    texte:
      "Ce qu'il reste à faire, ce qui presse, ce qui est terminé : une vue à jour, filtrable par étude, par statut ou par échéance.",
  },
  {
    icone: "page",
    titre: "Retrouver ses informations",
    texte:
      "Identifiants réglementaires, pièces du TMF, notes de travail, réponses déjà rédigées : ce qui sert au quotidien a une place.",
  },
  {
    icone: "graphique",
    titre: "Voir son portefeuille",
    texte:
      "L'état des études, la charge de l'équipe, l'avancement des checklists : une vue d'ensemble qui vient du travail déjà fait.",
  },
];

const usages: { icone: NomIcone; titre: string; texte: string }[] = [
  {
    icone: "dossier",
    titre: "Tenir le dossier de chaque étude",
    texte:
      "Promoteur, investigateur, ID-RCB, numéro CTIS, référence CPP, centre et calendrier. Le point d'entrée vers tout le reste.",
  },
  {
    icone: "drapeau",
    titre: "Savoir ce qu'il reste à faire",
    texte:
      "Missions en vue tableau, groupées par statut ou par échéance. Filtres, commentaires, export — pour prioriser sans tenir une liste à côté.",
  },
  {
    icone: "checklist",
    titre: "Suivre les obligations sans les reconstruire",
    texte:
      "Vous cochez le cadre applicable. Les lignes correspondantes apparaissent, par phase, avec leur référence. Cochables, annotables, ou marquées sans objet.",
  },
  {
    icone: "document",
    titre: "Classer les documents du TMF",
    texte:
      "Dépôt selon les catégories d'un Trial Master File. Chaque pièce conserve sa version et sa date, et reste retrouvable.",
  },
  {
    icone: "page",
    titre: "Noter à côté de l'étude",
    texte:
      "Un éditeur riche — titres, listes, tableaux, images — rattaché à l'étude et enregistré automatiquement.",
  },
  {
    icone: "chrono",
    titre: "Compter le temps passé",
    texte:
      "Chronomètre en un clic ou saisie manuelle aux formats usuels. Export valorisé, utile pour la refacturation au promoteur.",
  },
  {
    icone: "question",
    titre: "Capitaliser les réponses qui reviennent",
    texte:
      "Les questions fréquentes trouvent une réponse écrite une fois, classée par thème, générale ou propre à une étude.",
  },
  {
    icone: "bouclier",
    titre: "Suivre le monitorage et la qualité",
    texte:
      "Visites planifiées et réalisées, écarts constatés, actions correctives jusqu'à la vérification de leur efficacité.",
  },
];

const referentiels = [
  { sigle: "RIPH 1·2·3", texte: "Loi Jardé — art. L.1121-1 et s. du code de la santé publique" },
  { sigle: "536/2014", texte: "Essais cliniques de médicaments, dépôt et suivi via CTIS" },
  { sigle: "MDR", texte: "Règlement (UE) 2017/745 — investigations sur dispositifs médicaux" },
  { sigle: "IVDR", texte: "Règlement (UE) 2017/746 — études de performances en diagnostic in vitro" },
  { sigle: "ICH E6(R3)", texte: "Bonnes pratiques cliniques — Principes et Annexe 1" },
  { sigle: "CNIL", texte: "Méthodologies de référence — MR-001 et MR-003 refondues" },
];

export default function PagePresentation() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-24">
        <div aria-hidden className="lavure lavure-hero" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="hero-el hero-el-1 etiquette">Outil métier · Recherche clinique</span>

          <h1 className="hero-el hero-el-2 mt-8 font-titre text-[2.75rem] leading-[1.2] tracking-[-0.02em] sm:text-6xl lg:text-[80px]">
            Votre activité clinique, au même endroit
          </h1>

          <p className="hero-el hero-el-3 mx-auto mt-8 max-w-2xl text-[18px] leading-[1.35] tracking-[-0.022em] text-attenue sm:text-[20px]">
            Vigie Clinique est l&apos;espace de travail des équipes de recherche
            clinique. Vous y suivez vos études, vos missions et vos priorités —
            avec une interface pensée pour votre métier.
          </p>

          <div className="hero-el hero-el-4 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/connexion" className="bouton">
              Accéder à l&apos;espace
              <span aria-hidden>▸</span>
            </Link>
            <a href="#metiers" className="bouton-discret">
              Découvrir par métier
            </a>
          </div>
        </div>

        <ApercuProduit />
      </section>

      <section id="constat" className="scroll-mt-24 border-y border-ligne px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition className="max-w-2xl">
            <p className="sur-titre">Le constat</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Quand l&apos;activité vit dans trop d&apos;endroits à la fois
            </h2>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
              Le travail est là. Les informations, un peu partout : un fichier
              pour les études, un autre pour les tâches, un dossier partagé pour
              les documents, des suivis en parallèle. Avoir une vue claire de
              son activité devient un travail à part.
            </p>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 lg:grid-cols-3">
            {[
              {
                titre: "Informations dispersées",
                texte:
                  "Identifiants, notes, pièces et listes de suivi ne se parlent pas. Retrouver le bon élément demande de savoir où il a été mis.",
              },
              {
                titre: "Suivis parallèles",
                texte:
                  "Chacun tient le sien. Ce qui est à jour pour l'un ne l'est pas forcément pour l'autre. Les priorités se recollent à la main.",
              },
              {
                titre: "Vue d'ensemble à reconstruire",
                texte:
                  "L'état d'un portefeuille, la charge d'une semaine, ce qui retarde : il faut les assembler, souvent le matin d'une réunion.",
              },
            ].map((c) => (
              <article key={c.titre} className="carte p-10">
                <h3 className="font-titre text-2xl tracking-[-0.02em]">{c.titre}</h3>
                <p className="mt-4 text-base leading-[1.35] text-attenue">{c.texte}</p>
              </article>
            ))}
          </Apparition>
        </div>
      </section>

      <section id="reponse" className="scroll-mt-24 px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition className="max-w-2xl">
            <p className="sur-titre">La réponse</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Un espace de travail qui structure l&apos;activité
            </h2>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
              Vigie Clinique rassemble le dossier de chaque étude, ce qu&apos;il
              reste à faire, les documents, les obligations et le temps passé.
              L&apos;interface s&apos;adapte au métier — ARC, TEC ou chef de
              projet — sans imposer le même écran à tout le monde.
            </p>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {piliers.map((p) => (
              <article key={p.titre} className="carte p-10">
                <span className="flex h-5 w-5 text-encre">
                  <Icone nom={p.icone} className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-titre text-2xl tracking-[-0.02em]">{p.titre}</h3>
                <p className="mt-4 text-base leading-[1.35] text-attenue">{p.texte}</p>
              </article>
            ))}
          </Apparition>
        </div>
      </section>

      <section id="metiers" className="scroll-mt-24 border-y border-ligne px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition className="max-w-2xl">
            <p className="sur-titre">Par métier</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Un espace adapté à votre quotidien
            </h2>
            <p className="mt-6 text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
              À l&apos;inscription, vous indiquez votre métier. Vigie Clinique
              vous propose les parties de l&apos;outil qui vont avec. Vous les
              ajustez ensuite, à tout moment.
            </p>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 lg:grid-cols-3">
            {metiers.map((m, i) => (
              <article
                key={m.role}
                className={`rounded-[40px] p-10 ${
                  i === 0 ? "bg-pervenche" : "carte"
                }`}
              >
                <p className="sur-titre">{m.nom}</p>
                <h3 className="mt-3 font-titre text-[32px] tracking-[-0.02em]">{m.role}</h3>
                <p className="mt-4 text-base leading-[1.35] text-attenue">{m.quotidien}</p>
                <ul className="mt-6 space-y-3">
                  {m.apporte.map((s) => (
                    <li key={s} className="text-[14px] leading-[1.35] text-encre">
                      → {s}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Apparition>
        </div>
      </section>

      <section id="usages" className="scroll-mt-24 px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition className="max-w-2xl">
            <p className="sur-titre">Dans le travail</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Des réponses à des situations concrètes
            </h2>
            <p className="mt-6 text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
              Chaque partie de l&apos;outil correspond à un geste du métier —
              pas à une liste de fonctions à cocher.
            </p>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usages.map((f) => (
              <article key={f.titre} className="carte p-10">
                <span className="flex h-5 w-5 text-encre">
                  <Icone nom={f.icone} className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-titre text-2xl tracking-[-0.02em]">{f.titre}</h3>
                <p className="mt-4 text-base leading-[1.35] text-attenue">{f.texte}</p>
              </article>
            ))}
          </Apparition>
        </div>
      </section>

      <section id="pilotage" className="scroll-mt-24 border-y border-ligne px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-[1432px] items-start gap-16 lg:grid-cols-[1fr_1fr]">
          <Apparition>
            <p className="sur-titre">Vision d&apos;ensemble</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Une fois l&apos;activité structurée, la vue d&apos;ensemble vient
              d&apos;elle-même
            </h2>
            <p className="mt-6 text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
              Les indicateurs ne sont pas un produit à part. Ils lisent ce qui
              a déjà été saisi : avancement des missions, charge par étude,
              progression des checklists, conventions et reste à percevoir.
              De quoi présenter l&apos;activité en réunion sans reconstruire un
              tableau le matin.
            </p>
            <p className="mt-4 text-base leading-[1.35] text-attenue">
              Le portefeuille donne l&apos;état de chaque étude en une ligne.
              Le budget suit les conventions et les avenants. Le temps passé se
              valorise pour la refacturation. Tout cela s&apos;appuie sur le
              travail quotidien — il ne s&apos;y substitue pas.
            </p>
          </Apparition>

          <Apparition>
            <ul className="space-y-4">
              {[
                {
                  titre: "Portefeuille et charge",
                  texte: "L'état de chaque étude, et qui porte quoi sur celles que vous suivez.",
                },
                {
                  titre: "Budget et conventions",
                  texte: "Montant contractualisé, déjà perçu, reste à percevoir, échéances dépassées.",
                },
                {
                  titre: "Indicateurs d'activité",
                  texte: "Charge, retards, conformité des checklists, tendances du temps et des missions.",
                },
              ].map((l) => (
                <li key={l.titre} className="carte p-10">
                  <h3 className="font-titre text-2xl tracking-[-0.02em]">{l.titre}</h3>
                  <p className="mt-4 text-base leading-[1.35] text-attenue">{l.texte}</p>
                </li>
              ))}
            </ul>
          </Apparition>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-[1432px] gap-16 lg:grid-cols-[1fr_1.1fr]">
          <Apparition>
            <p className="sur-titre">Dans l&apos;outil</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Les obligations, déjà rédigées
            </h2>
            <p className="mt-6 text-[18px] leading-[1.35] text-attenue">
              Chaque ligne porte sa référence réglementaire, se coche,
              s&apos;annote, ou se marque « sans objet » — auquel cas elle sort
              du calcul de progression. Les lignes sont regroupées par phase :
              conception, soumission, mise en place, conduite, clôture.
            </p>
            <div className="carte mt-8 p-10">
              <p className="text-base leading-[1.35] text-attenue">
                <span className="text-encre">Une aide au travail, pas un avis réglementaire.</span>{" "}
                Les textes évoluent. Chaque référentiel affiche sa date de
                vérification et ses liens officiels ; il revient à chaque
                équipe de confirmer la version en vigueur auprès de
                l&apos;ANSM, du CPP, de la CNIL ou de l&apos;EMA.
              </p>
            </div>
            <Link href="/reglementaire" className="lien-fleche mt-8">
              Consulter les référentiels
              <span aria-hidden>→</span>
            </Link>
          </Apparition>

          <Apparition>
            <ul className="space-y-3">
              {referentiels.map((r) => (
                <li key={r.sigle} className="flex items-center gap-4 rounded-full border border-ligne px-5 py-4">
                  <span className="w-28 shrink-0 text-[12px] font-medium uppercase tracking-[-0.033em]">
                    {r.sigle}
                  </span>
                  <span className="text-[14px] leading-[1.35] text-attenue">{r.texte}</span>
                </li>
              ))}
            </ul>
          </Apparition>
        </div>
      </section>

      <section className="border-t border-ligne px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition className="max-w-2xl">
            <p className="sur-titre">Confiance</p>
            <h2 className="mt-4 font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Un outil installé chez vous, pensé pour rester à sa place
            </h2>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 lg:grid-cols-3">
            {[
              {
                icone: "bouclier" as NomIcone,
                titre: "Aucune donnée patient",
                texte:
                  "Vigie Clinique suit des projets, pas des personnes incluses. Aucune donnée de santé identifiante n'a vocation à y entrer.",
              },
              {
                icone: "personnes" as NomIcone,
                titre: "Chacun son compte",
                texte:
                  "Sessions individuelles, et partage explicite : une étude, une mission ou une page n'est visible que de son propriétaire et des personnes conviées.",
              },
              {
                icone: "eclair" as NomIcone,
                titre: "Chez vous, sans abonnement",
                texte:
                  "L'application s'installe sur votre propre serveur. Briques sous licence libre, versions figées : rien ne peut devenir payant.",
              },
            ].map((c) => (
              <article key={c.titre} className="carte p-10">
                <span className="flex h-5 w-5 text-encre">
                  <Icone nom={c.icone} className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-titre text-2xl tracking-[-0.02em]">{c.titre}</h3>
                <p className="mt-4 text-base leading-[1.35] text-attenue">{c.texte}</p>
              </article>
            ))}
          </Apparition>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-10 sm:pb-24">
        <div className="mx-auto max-w-[1432px]">
          <Apparition>
            <p className="sur-titre">Aller plus loin</p>
            <h2 className="mt-4 max-w-2xl font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
              Deux pages pour le détail
            </h2>
          </Apparition>

          <Apparition className="mt-16 grid gap-4 lg:grid-cols-2">
            <Link href="/reglementaire" className="carte carte-active group p-10">
              <h3 className="font-titre text-2xl tracking-[-0.02em]">Les référentiels couverts</h3>
              <p className="mt-4 text-base leading-[1.35] text-attenue">
                Le détail des cadres pris en charge — RIPH 1, 2 et 3, règlement
                UE 536/2014, MDR, IVDR, ICH E6(R3), méthodologies de référence
                de la CNIL, archivage — avec, pour chaque obligation, sa phase,
                sa référence et sa source officielle.
              </p>
              <span className="lien-fleche mt-8">
                Consulter les référentiels
                <span aria-hidden>→</span>
              </span>
            </Link>

            <Link href="/donnees" className="carte carte-active group p-10">
              <h3 className="font-titre text-2xl tracking-[-0.02em]">Confidentialité et hébergement</h3>
              <p className="mt-4 text-base leading-[1.35] text-attenue">
                Ce que l&apos;outil enregistre, ce qu&apos;il n&apos;a pas vocation
                à recevoir, où vivent les fichiers, comment les comptes et les
                partages sont cloisonnés.
              </p>
              <span className="lien-fleche mt-8">
                Lire la page sécurité
                <span aria-hidden>→</span>
              </span>
            </Link>
          </Apparition>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-10 sm:pb-32">
        <Apparition>
          <div className="relative mx-auto max-w-[1432px] overflow-hidden rounded-[40px] bg-pervenche px-8 py-20 text-center sm:px-16">
            <div aria-hidden className="lavure lavure-cta" />
            <div className="relative">
              <h2 className="font-titre text-[32px] tracking-[-0.02em] sm:text-[48px]">
                Retrouver son activité, et la suivre
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-[18px] leading-[1.35] text-attenue">
                Vigie Clinique s&apos;installe chez vous. L&apos;accès à
                l&apos;espace de travail se fait avec un compte — par invitation,
                ou avec le compte déjà créé sur cette installation.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/connexion" className="bouton">
                  Se connecter
                  <span aria-hidden>▸</span>
                </Link>
                <a href="#usages" className="bouton-discret">
                  Explorer les usages
                </a>
              </div>
            </div>
          </div>
        </Apparition>
      </section>
    </>
  );
}
