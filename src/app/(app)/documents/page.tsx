import Link from "next/link";
import FormulaireDocument from "@/components/formulaire-document";
import MenuExport from "@/components/menu-export";
import ListeDocuments from "@/components/liste-documents";
import { CATEGORIES_DOCUMENT, octetsLisibles } from "@/lib/constantes";
import { listerEtudes, tousLesDocuments } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageDocuments({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; categorie?: string; q?: string }>;
}) {
  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [lignesBrutes, etudes] = await Promise.all([
    tousLesDocuments({ etudeId, categorie: params.categorie }),
    listerEtudes({ avecArchivees: true }),
  ]);

  const recherche = (params.q ?? "").trim().toLowerCase();
  const lignes = recherche
    ? lignesBrutes.filter(({ document }) =>
        `${document.nom} ${document.description ?? ""} ${document.nomOriginal}`
          .toLowerCase()
          .includes(recherche),
      )
    : lignesBrutes;

  const volumeTotal = lignes.reduce((t, l) => t + l.document.taille, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Documents</h1>
          <p className="mt-1 text-sm text-attenue">
            {lignes.length} document{lignes.length > 1 ? "s" : ""} ·{" "}
            <span className="chiffres">{octetsLisibles(volumeTotal)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MenuExport
            base="/api/export-documents"
            parametres={
              Object.fromEntries(
                Object.entries({ etude: etudeId ? String(etudeId) : "", categorie: params.categorie ?? "" }).filter(
                  ([, v]) => v,
                ),
              ) as Record<string, string>
            }
          />
          <FormulaireDocument etudes={etudes} libelle="Ajouter un document" />
        </div>
      </header>

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="mb-1.5 block text-xs text-attenue">
            Rechercher
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Nom ou description"
            className="champ"
          />
        </div>

        <div className="min-w-44">
          <label htmlFor="etude" className="mb-1.5 block text-xs text-attenue">
            Étude
          </label>
          <select id="etude" name="etude" defaultValue={params.etude ?? ""} className="champ">
            <option value="">Toutes</option>
            {etudes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code ? `${e.code} — ${e.nom}` : e.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-52">
          <label htmlFor="categorie" className="mb-1.5 block text-xs text-attenue">
            Catégorie
          </label>
          <select
            id="categorie"
            name="categorie"
            defaultValue={params.categorie ?? ""}
            className="champ"
          >
            <option value="">Toutes</option>
            {Object.entries(CATEGORIES_DOCUMENT).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
        {(params.q || params.etude || params.categorie) && (
          <Link href="/documents" className="pb-2 text-sm text-attenue hover:text-encre">
            Réinitialiser
          </Link>
        )}
      </form>

      <ListeDocuments
        lignes={lignes}
        etudes={etudes}
        message="Aucun document ne correspond à ces filtres."
      />
    </div>
  );
}
