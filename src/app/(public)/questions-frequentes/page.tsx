import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_PUBLIQUE } from "@/lib/faq-publique";

export const metadata: Metadata = {
  title: "Questions fréquentes — Vigie, recherche clinique",
  description:
    "FAQ de Vigie : eCRF ou gestion de projet, Subject ID, comptes, hébergement, RGPD, queries, monitoring, TMF, CAPA, checklists réglementaires, filtre d'entreprise.",
  alternates: { canonical: "/questions-frequentes" },
};

export default function PageQuestionsFrequentes() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Aide</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Questions fréquentes
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-attenue">
        Réponses courtes sur ce qu&apos;est Vigie, ce qu&apos;il n&apos;est pas, et
        comment une équipe hospitalière s&apos;en sert. Pour le mode d&apos;emploi
        pas à pas, voir les{" "}
        <Link href="/guides" className="text-accent hover:underline">
          guides
        </Link>{" "}
        et la page{" "}
        <Link href="/aide" className="text-accent hover:underline">
          Aide
        </Link>
        .
      </p>
      <dl className="mt-12 space-y-10">
        {FAQ_PUBLIQUE.map((item) => (
          <div key={item.question}>
            <dt className="font-titre text-xl font-bold">{item.question}</dt>
            <dd className="mt-3 leading-relaxed text-attenue">{item.reponse}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-14 text-sm text-attenue">
        Une question absente de cette liste ? La page{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Contact
        </Link>{" "}
        indique comment joindre l&apos;équipe qui héberge cette instance.
      </p>
    </article>
  );
}
