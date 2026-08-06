import { supprimerDocument } from "@/actions/documents";
import FormulaireDocument from "./formulaire-document";
import { CATEGORIES_DOCUMENT, ORDRE_CATEGORIES_DOCUMENT, octetsLisibles } from "@/lib/constantes";
import { formaterDate } from "@/lib/format";
import type { Document, Etude } from "@/db/schema";

export type LigneDocument = {
  document: Document;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudeCouleur?: string | null;
};

function icone(typeMime: string): string {
  if (typeMime.includes("pdf")) return "📕";
  if (typeMime.startsWith("image/")) return "🖼";
  if (typeMime.includes("word") || typeMime.includes("document")) return "📘";
  if (typeMime.includes("sheet") || typeMime.includes("excel") || typeMime.includes("csv"))
    return "📗";
  if (typeMime.includes("zip")) return "🗜";
  return "📄";
}

export default function ListeDocuments({
  lignes,
  etudes,
  afficherEtude = true,
  message = "Aucun document.",
}: {
  lignes: LigneDocument[];
  etudes: Pick<Etude, "id" | "nom">[];
  afficherEtude?: boolean;
  message?: string;
}) {
  if (lignes.length === 0) {
    return <p className="carte p-8 text-center text-sm text-attenue">{message}</p>;
  }

  // Regroupement par catégorie, dans l'ordre du TMF.
  const parCategorie = new Map<string, LigneDocument[]>();
  for (const l of lignes) {
    const c = l.document.categorie;
    parCategorie.set(c, [...(parCategorie.get(c) ?? []), l]);
  }

  const categories = ORDRE_CATEGORIES_DOCUMENT.filter((c) => parCategorie.has(c));

  return (
    <div className="space-y-5">
      {categories.map((categorie) => (
        <section key={categorie}>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-attenue">
            {CATEGORIES_DOCUMENT[categorie] ?? categorie}
            <span className="chiffres ml-2 font-normal opacity-70">
              {parCategorie.get(categorie)!.length}
            </span>
          </h3>

          <ul className="carte divide-y divide-ligne">
            {parCategorie.get(categorie)!.map(({ document, etudeNom, etudeCode, etudeCouleur }) => (
              <li key={document.id} className="group flex items-center gap-3 px-4 py-3">
                <span aria-hidden className="text-lg leading-none">
                  {icone(document.typeMime)}
                </span>

                <div className="min-w-0 flex-1">
                  <a
                    href={`/api/documents/${document.id}?apercu=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium underline-offset-2 hover:text-accent hover:underline"
                  >
                    {document.nom}
                    {document.version && (
                      <span className="ml-1.5 font-normal text-attenue">v{document.version}</span>
                    )}
                  </a>

                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-attenue">
                    {afficherEtude && etudeNom && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: etudeCouleur ?? "#a8a29e" }}
                        />
                        {etudeCode ?? etudeNom}
                      </span>
                    )}
                    <span className="chiffres">{octetsLisibles(document.taille)}</span>
                    {document.dateDocument && (
                      <span>document du {formaterDate(document.dateDocument)}</span>
                    )}
                    <span>déposé le {formaterDate(document.creeLe)}</span>
                  </p>

                  {document.description && (
                    <p className="mt-1 text-xs text-attenue">{document.description}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                  <a
                    href={`/api/documents/${document.id}`}
                    download
                    title="Télécharger"
                    aria-label={`Télécharger ${document.nom}`}
                    className="rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-accent"
                  >
                    ⬇
                  </a>
                  <FormulaireDocument
                    document={document}
                    etudes={etudes}
                    libelle="✎"
                    variante="icone"
                  />
                  <form action={supprimerDocument}>
                    <input type="hidden" name="id" value={document.id} />
                    <button
                      type="submit"
                      title="Supprimer le document"
                      aria-label={`Supprimer ${document.nom}`}
                      className="rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-alerte"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
