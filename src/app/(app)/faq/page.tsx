import Link from "next/link";
import FormulaireFaq from "@/components/formulaire-faq";
import ListeFaq from "@/components/liste-faq";
import { entreesFaq, listerEtudes } from "@/lib/requetes";

export const dynamic = "force-dynamic";

export default async function PageFaq({
  searchParams,
}: {
  searchParams: Promise<{ portee?: string; etude?: string; q?: string }>;
}) {
  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [toutes, etudes] = await Promise.all([
    entreesFaq({ etudeId, portee: params.portee }),
    listerEtudes({ avecArchivees: true }),
  ]);

  const recherche = (params.q ?? "").trim().toLowerCase();
  const lignes = recherche
    ? toutes.filter(({ entree }) =>
        `${entree.question} ${entree.reponse}`.toLowerCase().includes(recherche),
      )
    : toutes;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Base de connaissance</h1>
          <p className="mt-1 text-sm text-attenue">
            Vos réponses de référence, à écrire une fois et à retrouver ensuite.
          </p>
        </div>
        <FormulaireFaq etudes={etudes} libelle="Nouvelle question" />
      </header>

      <form method="get" className="carte flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="mb-1.5 block text-xs text-attenue">
            Rechercher
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Un mot de la question ou de la réponse"
            className="champ"
          />
        </div>

        <div className="min-w-44">
          <label htmlFor="portee" className="mb-1.5 block text-xs text-attenue">
            Portée
          </label>
          <select id="portee" name="portee" defaultValue={params.portee ?? ""} className="champ">
            <option value="">Toutes</option>
            <option value="generale">FAQ générale uniquement</option>
          </select>
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

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
        {(params.q || params.etude || params.portee) && (
          <Link href="/faq" className="pb-2 text-sm text-attenue hover:text-encre">
            Réinitialiser
          </Link>
        )}
      </form>

      <ListeFaq
        lignes={lignes}
        etudes={etudes}
        message="Aucune question ne correspond à cette recherche."
      />
    </div>
  );
}
