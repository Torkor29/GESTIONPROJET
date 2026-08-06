import { supprimerFaq } from "@/actions/faq";
import FormulaireFaq from "./formulaire-faq";
import { CATEGORIES_FAQ } from "@/lib/constantes";
import type { Etude, Faq } from "@/db/schema";

export type LigneFaq = {
  entree: Faq;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
};

export default function ListeFaq({
  lignes,
  etudes,
  afficherPortee = true,
  message = "Aucune question enregistrée.",
}: {
  lignes: LigneFaq[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherPortee?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-8 text-center text-sm text-attenue">{message}</p>;
  }

  const parCategorie = new Map<string, LigneFaq[]>();
  for (const l of lignes) {
    const c = l.entree.categorie;
    parCategorie.set(c, [...(parCategorie.get(c) ?? []), l]);
  }

  const categories = Object.keys(CATEGORIES_FAQ).filter((c) => parCategorie.has(c));

  return (
    <div className="space-y-5">
      {categories.map((categorie) => (
        <section key={categorie}>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-attenue">
            {CATEGORIES_FAQ[categorie] ?? categorie}
          </h3>

          <div className="carte divide-y divide-ligne">
            {parCategorie.get(categorie)!.map(({ entree, etudeCode, etudeNom, etudeCouleur }) => (
              <details key={entree.id} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 text-xs text-attenue transition group-open:rotate-90"
                  >
                    ▶
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{entree.question}</span>
                    {afficherPortee && (
                      <span className="mt-0.5 block text-xs text-attenue">
                        {etudeNom ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: etudeCouleur ?? "#a8a29e" }}
                            />
                            {etudeCode ?? etudeNom}
                          </span>
                        ) : (
                          "FAQ générale"
                        )}
                      </span>
                    )}
                  </span>
                </summary>

                <div className="ml-6 mt-2.5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{entree.reponse}</p>

                  <div className="mt-2.5 flex items-center gap-1">
                    <FormulaireFaq
                      entree={entree}
                      etudes={etudes}
                      libelle="✎ Modifier"
                      variante="icone"
                    />
                    <form action={supprimerFaq}>
                      <input type="hidden" name="id" value={entree.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-alerte"
                      >
                        ✕ Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
