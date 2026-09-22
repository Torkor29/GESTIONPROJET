import Link from "next/link";
import FormulairePenseBete from "./formulaire-pense-bete";
import { formaterDate } from "@/lib/format";
import { grouperParCategorie, SANS_CATEGORIE } from "@/lib/pense-bete";
import type { Etude, Page } from "@/db/schema";

export default function ListePenseBete({
  pages,
  etudes = [],
  etudeIdParDefaut,
  afficherEtude = false,
  message = "Aucune page pour l'instant.",
}: {
  pages: Page[];
  etudes?: Pick<Etude, "id" | "nom" | "code">[];
  etudeIdParDefaut?: number;
  afficherEtude?: boolean;
  message?: string;
}) {
  const categories = [...new Set(pages.map((p) => p.categorie).filter(Boolean))];
  const groupes = grouperParCategorie(pages);

  if (pages.length === 0) {
    return <p className="carte p-8 text-center text-sm text-attenue">{message}</p>;
  }

  return (
    <div className="space-y-6">
      {groupes.map((groupe) => (
        <section key={groupe.nom}>
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-attenue">
              {groupe.nom}
            </h3>
            <FormulairePenseBete
              categories={categories}
              etudes={etudes}
              etudeIdParDefaut={etudeIdParDefaut}
              categorieParDefaut={groupe.nom === SANS_CATEGORIE ? "" : groupe.nom}
              libelle="+ Page"
              variante="compact"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupe.pages.map((p) => {
              const etude = afficherEtude && p.etudeId
                ? etudes.find((e) => e.id === p.etudeId)
                : null;
              return (
                <Link
                  key={p.id}
                  href={`/pages/${p.id}`}
                  className="carte flex items-start gap-3 p-4 transition hover:border-accent/50"
                >
                  <span aria-hidden className="text-xl leading-none">
                    {p.icone}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.titre}</p>
                    <p className="mt-0.5 text-xs text-attenue">
                      {etude ? `${etude.code ?? etude.nom} · ` : ""}
                      modifiée le {formaterDate(p.modifieLe)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
