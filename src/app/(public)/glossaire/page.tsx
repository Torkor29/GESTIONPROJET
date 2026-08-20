import type { Metadata } from "next";
import Link from "next/link";
import { TERMES_GLOSSAIRE } from "@/lib/glossaire-public";

export const metadata: Metadata = {
  title: "Glossaire de la recherche clinique — Vigie",
  description:
    "Glossaire opérationnel de la recherche clinique : query, CRF, Subject ID, monitoring, déviation, CAPA, TMF, database lock, SAE, RIPH, CTIS, MDR, IVDR, ICH E6(R3), ARC, TEC, data manager. Destiné aux équipes hospitalières.",
  alternates: { canonical: "/glossaire" },
};

export default function PageGlossaire() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Référence</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">
        Glossaire opérationnel de la recherche clinique
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-attenue">
        Vocabulaire utilisé dans Vigie et dans les unités de recherche clinique
        hospitalière. Ces définitions sont opérationnelles : elles aident à se
        comprendre entre ARC, data managers, chefs de projet et investigateurs.
        Elles ne remplacent pas un texte réglementaire, une SOP d&apos;établissement
        ni un dictionnaire MedDRA.
      </p>
      <p className="mt-3 text-sm text-attenue">
        {TERMES_GLOSSAIRE.length} termes. Pour le fil de travail, voir la{" "}
        <Link href="/methodologie" className="text-accent hover:underline">
          méthodologie
        </Link>{" "}
        et les{" "}
        <Link href="/guides" className="text-accent hover:underline">
          guides
        </Link>
        . Pour les cadres juridiques commentés, les{" "}
        <Link href="/reglementaire" className="text-accent hover:underline">
          référentiels
        </Link>
        .
      </p>
      <dl className="mt-10 space-y-8">
        {TERMES_GLOSSAIRE.map((t) => (
          <div key={t.mot} id={t.mot.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
            <dt className="font-titre text-xl font-bold">{t.mot}</dt>
            <dd className="mt-2 leading-relaxed text-attenue">{t.def}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
