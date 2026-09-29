import FormulairePenseBete from "@/components/formulaire-pense-bete";
import ListePenseBete from "@/components/liste-pense-bete";
import { listerEtudes, pagesPenseBete } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PagePenseBete({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string }>;
}) {
  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [pages, etudes] = await Promise.all([
    pagesPenseBete(etudeId ? { etudeId } : {}),
    listerEtudes({ avecArchivees: true }),
  ]);

  const categories = [...new Set(pages.map((p) => p.categorie).filter(Boolean))];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Pense-bête</h1>
          <p className="mt-1 max-w-xl text-sm text-attenue">
            Des pages rangées par catégorie : un compte rendu, une liste, un mode opératoire.
            Texte, images, tout ce qui sert à se souvenir.
          </p>
        </div>
        <FormulairePenseBete
          categories={categories}
          etudes={etudes}
          libelle="Nouvelle page"
        />
      </header>

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
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
        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
      </form>

      <ListePenseBete
        pages={pages}
        etudes={etudes}
        afficherEtude={!etudeId}
        message="Aucune page pour l'instant. Créez-en une et rangez-la dans une catégorie."
      />
    </div>
  );
}
