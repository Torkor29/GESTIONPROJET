import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ce que Vigie est et n'est pas — comparatif",
  description:
    "Vigie est un logiciel de clinical operations hospitalier. Ce n'est pas un eCRF, ni CTIS, ni une base de pharmacovigilance, ni un LIMS, ni un outil de randomisation, ni une attestation RGPD.",
  alternates: { canonical: "/comparatif" },
};

const est = [
  "Un outil de gestion de projet pour les équipes de recherche clinique.",
  "Un fil étude → centres → sujets (Subject ID) → visites → queries → monitoring → TMF → tâches.",
  "Un système de comptes nominatifs, de rôles serveur et de journal d'audit.",
  "Un classeur de documents essentiels, versionnés, parfois datés d'expiration.",
  "Un jeu de checklists réglementaires sourcées, datées, présentées comme aide au travail.",
  "Une application auto-hébergée, sans abonnement éditeur obligatoire.",
];

const nestPas = [
  "Un eCRF / EDC promoteur, ni un substitut de saisie clinique.",
  "Un guichet CTIS, CPP, ANSM ou organisme notifié.",
  "Une base de pharmacovigilance ou un outil de déclaration SAE/SUSAR.",
  "Un IWRS, une randomisation, une gestion de stock de traitement.",
  "Un LIMS ou un registre d'échantillons biologiques.",
  "Un DPI, un dossier patient, un compte rendu de RCP.",
  "Une GED hospitalière complète ou un TMF Reference Model exhaustif.",
  "Une attestation RGPD, 21 CFR Part 11, HDS ou ICH-GCP « certified ».",
];

export default function PageComparatif() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Produit</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Ce que Vigie est, et ce qu&apos;il refuse d&apos;être
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-attenue">
        Beaucoup d&apos;outils promettent « tout le clinique ». Vigie trace une
        frontière. Elle évite de mal faire le suivi de projet en voulant aussi
        être un eCRF, une PV et un dossier réglementaire. Cette page existe pour
        les chefs de projet, les DSI et les filtres automatiques qui tentent de
        classer le site.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="carte p-6">
          <h2 className="font-titre text-xl font-bold">Vigie est</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-attenue">
            {est.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section className="carte p-6">
          <h2 className="font-titre text-xl font-bold">Vigie n&apos;est pas</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-attenue">
            {nestPas.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ligne-forte" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-12 space-y-5 text-[17px] leading-relaxed text-attenue">
        <h2 className="font-titre text-2xl font-bold text-encre">
          Avec quoi ça cohabite
        </h2>
        <p>
          En pratique, une unité garde l&apos;eCRF du promoteur, le DPI de
          l&apos;hôpital, parfois un outil de PV, parfois CTIS, parfois un LIMS.
          Vigie prend la couche « qui fait quoi, pour quand, où en est-on ». Les
          exports servent les réunions. Ils ne remplacent pas un SDTM.
        </p>
        <p>
          Si vous cherchez un eCRF, ce site n&apos;est pas le bon. Si vous cherchez
          comment un ARC, un data manager et un chef de projet cessent de
          s&apos;envoyer le même tableur, commencez par{" "}
          <Link href="/a-propos" className="text-accent hover:underline">
            À propos
          </Link>
          , les{" "}
          <Link href="/metiers" className="text-accent hover:underline">
            métiers
          </Link>{" "}
          et l&apos;article{" "}
          <Link
            href="/actualites/pourquoi-outil-dedie"
            className="text-accent hover:underline"
          >
            Pourquoi un outil dédié
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
