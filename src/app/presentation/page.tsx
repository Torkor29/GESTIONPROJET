import type { Metadata } from "next";
import Link from "next/link";
import { Icone, type NomIcone } from "@/components/icones";

export const metadata: Metadata = {
  title: "Vigie — Gestion de projet en recherche clinique",
  description:
    "Vigie est un outil de gestion de projet destiné aux équipes de recherche clinique hospitalière : suivi des études et des missions, checklists réglementaires (RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL), archivage documentaire TMF, base de connaissance et suivi du temps.",
};

const metiers = [
  {
    role: "ARC",
    nom: "Attaché de recherche clinique",
    suit: ["Visites de monitorage", "Écarts et actions correctives", "Vérification des données sources"],
  },
  {
    role: "TEC",
    nom: "Technicien d'étude clinique",
    suit: ["Screening et inclusions", "Saisie et requêtes", "Facturation des actes"],
  },
  {
    role: "CP",
    nom: "Chef de projet",
    suit: ["Portefeuille d'études", "Jalons réglementaires", "Charge de l'équipe"],
  },
];

const fonctions: { icone: NomIcone; titre: string; texte: string }[] = [
  {
    icone: "dossier",
    titre: "Études",
    texte:
      "Un dossier par étude : promoteur, investigateur, ID-RCB, numéro CTIS, référence CPP, centre et calendrier. Le point d'entrée vers tout le reste.",
  },
  {
    icone: "checklist",
    titre: "Checklists réglementaires",
    texte:
      "Cochez le cadre applicable, les obligations correspondantes apparaissent — regroupées par phase, avec leur référence, cochables et annotables.",
  },
  {
    icone: "drapeau",
    titre: "Missions",
    texte:
      "Ce qu'il reste à faire, en vue tableau, groupé par statut ou par échéance. Filtres par étude et par statut, commentaires, export.",
  },
  {
    icone: "document",
    titre: "Documents",
    texte:
      "Dépôt et classement selon les catégories d'un Trial Master File. Chaque document conserve sa version et sa date, et reste retrouvable.",
  },
  {
    icone: "page",
    titre: "Pages de travail",
    texte:
      "Un éditeur riche façon Notion — titres, listes, tableaux, images — rattaché à une étude et enregistré automatiquement.",
  },
  {
    icone: "chrono",
    titre: "Suivi du temps",
    texte:
      "Chronomètre en un clic ou saisie manuelle aux formats usuels. Export valorisé, utile pour la refacturation au promoteur.",
  },
  {
    icone: "question",
    titre: "Base de connaissance",
    texte:
      "Les questions qui reviennent trouvent une réponse écrite une fois pour toutes, classée par thème, générale ou propre à une étude.",
  },
  {
    icone: "graphique",
    titre: "Indicateurs",
    texte:
      "Avancement des missions, charge par étude, progression des checklists — des chiffres qu'on peut présenter en réunion.",
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
    <div className="min-h-screen bg-surface">
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-20 border-b border-ligne/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <span className="flex items-center gap-2.5 font-titre text-[15px] font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-sur-accent shadow-douce">
              <Icone nom="eclair" className="h-4 w-4" />
            </span>
            Vigie
          </span>
          <Link href="/connexion" className="bouton-discret !py-2 text-[13px]">
            Se connecter
          </Link>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------- hero */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
          {/* Halo d'accent très dilué, pour que le haut de page ne soit pas plat. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="etiquette border border-accent/25 bg-accent-voile/60 text-accent-appuye">
              Recherche clinique hospitalière
            </span>

            <h1 className="mt-6 font-titre text-4xl font-bold leading-[1.1] sm:text-[3.4rem]">
              Vos études, vos missions et vos obligations —{" "}
              <span className="text-accent">au même endroit</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-attenue">
              Vigie remplace le tableur, la boîte mail et le dossier partagé par
              un outil qui parle le vocabulaire de la recherche clinique.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/connexion" className="bouton">
                Accéder à l&apos;application
                <Icone nom="fleche" className="h-4 w-4" />
              </Link>
              <a href="#fonctions" className="bouton-discret">
                Voir les fonctions
              </a>
            </div>
          </div>

          {/* Aperçu : donne à voir l'outil plutôt que de le décrire. */}
          <div className="relative mx-auto mt-16 max-w-3xl animate-apparait">
            <div className="carte overflow-hidden !shadow-elevee">
              <div className="flex items-center gap-2 border-b border-ligne bg-creux px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
                <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
                <span className="h-2.5 w-2.5 rounded-full bg-ligne-forte" />
                <span className="ml-2 text-xs font-medium text-efface">PROTECT-2 — RIPH 1</span>
              </div>

              <div className="space-y-5 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="sur-titre">Étude interventionnelle</p>
                    <h2 className="mt-1 font-titre text-xl font-bold">PROTECT-2</h2>
                  </div>
                  <span className="etiquette bg-reussite-voile text-reussite">En cours</span>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between text-sm">
                    <span className="font-medium">Checklist réglementaire</span>
                    <span className="chiffres text-attenue">31 / 47</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-creux">
                    <div className="h-full w-[66%] rounded-full bg-accent" />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { t: "Soumission de l'amendement n° 3", s: "À faire", c: "attention" },
                    { t: "Visite de monitorage — centre 04", s: "En cours", c: "info" },
                    { t: "Mise à jour du TMF", s: "Terminé", c: "reussite" },
                  ].map((m) => (
                    <div
                      key={m.t}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ligne bg-surface px-3.5 py-2.5"
                    >
                      <span className="truncate text-sm">{m.t}</span>
                      <span
                        className={`etiquette shrink-0 ${
                          m.c === "attention"
                            ? "bg-attention-voile text-attention"
                            : m.c === "info"
                              ? "bg-info-voile text-info"
                              : "bg-reussite-voile text-reussite"
                        }`}
                      >
                        {m.s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- métiers */}
        <section className="border-y border-ligne bg-creux/60 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="sur-titre">Par métier</p>
              <h2 className="mt-3 font-titre text-3xl font-bold">
                Chacun voit ce qui le concerne
              </h2>
              <p className="mt-3 text-attenue">
                À l&apos;inscription, vous indiquez votre métier et Vigie vous
                propose les modules qui vont avec. Vous les ajustez ensuite
                librement, à tout moment.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metiers.map((m) => (
                <article key={m.role} className="carte-active p-6">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-titre text-2xl font-bold text-accent">{m.role}</span>
                    <span className="text-xs text-efface">{m.nom}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {m.suit.map((s) => (
                      <li key={s} className="flex items-start gap-2.5 text-sm text-attenue">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- fonctionnalités */}
        <section id="fonctions" className="scroll-mt-16 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="sur-titre">Fonctions</p>
              <h2 className="mt-3 font-titre text-3xl font-bold">Ce que fait Vigie</h2>
            </div>

            <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {fonctions.map((f) => (
                <article key={f.titre}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-voile text-accent-appuye">
                    <Icone nom={f.icone} />
                  </span>
                  <h3 className="mt-4 font-titre text-base font-bold">{f.titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-attenue">{f.texte}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ référentiels */}
        <section className="border-y border-ligne bg-creux/60 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="sur-titre">Référentiels</p>
              <h2 className="mt-3 font-titre text-3xl font-bold">
                Les obligations, déjà écrites
              </h2>
              <p className="mt-4 text-attenue">
                Chaque ligne porte sa référence réglementaire, se coche,
                s&apos;annote, ou se marque « sans objet » — auquel cas elle sort
                du calcul de progression. Les lignes sont regroupées par phase :
                conception, soumission, mise en place, conduite, clôture.
              </p>
              <div className="carte mt-7 border-attention/25 bg-attention-voile/40 p-5">
                <p className="text-sm leading-relaxed text-attenue">
                  <strong className="font-semibold text-encre">
                    Une aide au travail, pas un avis réglementaire.
                  </strong>{" "}
                  Les textes évoluent. Chaque référentiel affiche sa date de
                  vérification et ses liens officiels ; il revient à chaque
                  équipe de confirmer la version en vigueur auprès de
                  l&apos;ANSM, du CPP, de la CNIL ou de l&apos;EMA.
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {referentiels.map((r) => (
                <li key={r.sigle} className="carte flex items-center gap-4 p-4">
                  <span className="flex w-28 shrink-0 justify-center rounded-lg bg-accent-voile px-2 py-1.5 text-center font-titre text-xs font-bold text-accent-appuye">
                    {r.sigle}
                  </span>
                  <span className="text-sm text-attenue">{r.texte}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------- confiance */}
        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            {[
              {
                icone: "bouclier" as NomIcone,
                titre: "Aucune donnée patient",
                texte:
                  "Vigie suit des projets, pas des personnes incluses. Aucune donnée de santé identifiante n'a vocation à y entrer.",
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
              <article key={c.titre}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-ligne bg-relief text-accent shadow-posee">
                  <Icone nom={c.icone} />
                </span>
                <h3 className="mt-4 font-titre text-base font-bold">{c.titre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-attenue">{c.texte}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------- appel final */}
        <section className="px-6 pb-28">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-ligne bg-relief px-8 py-16 text-center shadow-douce">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-full h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[80px]"
            />
            <div className="relative">
              <h2 className="font-titre text-3xl font-bold">Commencer</h2>
              <p className="mx-auto mt-3 max-w-md text-attenue">
                Vigie est un outil de travail à accès restreint. La consultation
                des études, des missions et des documents demande un compte.
              </p>
              <div className="mt-8">
                <Link href="/connexion" className="bouton">
                  Se connecter
                  <Icone nom="fleche" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ligne px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-titre text-sm font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-sur-accent">
              <Icone nom="eclair" className="h-3.5 w-3.5" />
            </span>
            Vigie
          </span>
          <p className="text-sm text-efface">
            Outil de gestion de projet pour la recherche clinique.
          </p>
        </div>
      </footer>
    </div>
  );
}
