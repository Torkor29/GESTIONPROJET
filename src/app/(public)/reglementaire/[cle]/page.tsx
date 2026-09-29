import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icone } from "@/components/icones";
import { NOM_PRODUIT } from "@/lib/site";
import {
  AVERTISSEMENT,
  LIBELLES_PHASE,
  ORDRE_PHASES,
  REFERENTIELS,
  referentiel,
} from "@/lib/referentiels";

/** Les référentiels sont connus à la construction : autant les pré-rendre. */
export function generateStaticParams() {
  return REFERENTIELS.map((r) => ({ cle: r.cle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cle: string }>;
}): Promise<Metadata> {
  const { cle } = await params;
  const r = referentiel(cle);
  if (!r) return { title: `Référentiel introuvable — ${NOM_PRODUIT}` };

  return {
    title: `${r.nom} — ${NOM_PRODUIT}`,
    description: `${r.resume} ${r.items.length} obligations réparties sur les phases du projet, avec leur référence réglementaire. Aide au suivi dans l'espace de travail Vigie Clinique.`,
    alternates: { canonical: `/reglementaire/${r.cle}` },
  };
}

function dateLisible(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PageReferentiel({
  params,
}: {
  params: Promise<{ cle: string }>;
}) {
  const { cle } = await params;
  const r = referentiel(cle);
  if (!r) notFound();

  const phases = ORDRE_PHASES.map((p) => ({
    phase: p,
    items: r.items.filter((i) => i.phase === p),
  })).filter((g) => g.items.length > 0);

  const recommandees = r.items.filter((i) => i.obligatoire === false).length;

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/reglementaire"
          className="inline-flex items-center gap-1.5 text-sm text-attenue transition-colors hover:text-accent"
        >
          <Icone nom="fleche" className="h-4 w-4 rotate-180" />
          Tous les référentiels
        </Link>

        <p className="sur-titre mt-8">
          {r.categorie === "type" ? "Selon le type de recherche" : "Cadre transversal"}
        </p>
        <h1 className="mt-4 font-titre text-[32px] leading-[1.2] tracking-[-0.02em] sm:text-[40px]">{r.nom}</h1>
        <p className="mt-6 text-[18px] leading-[1.35] text-attenue">{r.resume}</p>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="carte p-4">
            <dt className="sur-titre">Obligations</dt>
            <dd className="chiffres mt-1 font-titre text-2xl font-bold">{r.items.length}</dd>
          </div>
          <div className="carte p-4">
            <dt className="sur-titre">Phases couvertes</dt>
            <dd className="chiffres mt-1 font-titre text-2xl font-bold">{phases.length}</dd>
          </div>
          <div className="carte p-4">
            <dt className="sur-titre">Contenu vérifié le</dt>
            <dd className="mt-1 font-titre text-base font-bold">{dateLisible(r.verifieLe)}</dd>
          </div>
        </dl>

        {recommandees > 0 && (
          <p className="mt-4 text-sm text-attenue">
            {recommandees} de ces {r.items.length} lignes sont des bonnes pratiques
            recommandées et non des obligations : elles sont signalées comme telles
            dans l&apos;application.
          </p>
        )}

        {phases.map((g) => (
          <section key={g.phase} className="mt-14">
            <h2 className="font-titre text-2xl font-bold">{LIBELLES_PHASE[g.phase]}</h2>

            <ul className="mt-5 space-y-3">
              {g.items.map((i) => (
                <li key={i.cle} className="carte p-5">
                  <div className="flex items-start gap-3">
                    {/* Case décorative : sur le site public, rien n'est cochable. */}
                    <span
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ligne-forte"
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium leading-snug">{i.titre}</h3>
                      {i.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-attenue">
                          {i.description}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {i.reference && (
                          <span className="etiquette bg-relief text-attenue">{i.reference}</span>
                        )}
                        {i.obligatoire === false && (
                          <span className="etiquette bg-info-voile text-info">Recommandé</span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">Sources</h2>
          <ul className="mt-4 space-y-2">
            {r.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 text-sm text-accent hover:underline"
                >
                  <Icone nom="document" className="mt-0.5 h-4 w-4 shrink-0" />
                  {s.libelle}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="carte mt-10 border-attention/30 bg-attention-voile/40 p-5 text-sm leading-relaxed">
          <strong className="font-semibold">{AVERTISSEMENT}</strong> Ce contenu a
          été vérifié le {dateLisible(r.verifieLe)} ; les textes évoluent.
        </p>
      </div>
    </div>
  );
}
