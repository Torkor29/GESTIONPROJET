import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { GRAVITES_ECART, STATUTS_ECART } from "@/lib/constantes";
import { listerEtudes, tousLesEcarts, visitesPourChoix } from "@/lib/requetes";
import FormulaireEcart from "@/components/formulaire-ecart";
import TableauEcarts from "@/components/tableau-ecarts";

export const dynamic = "force-dynamic";

export default async function PageEcarts({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; statut?: string; gravite?: string }>;
}) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [lignes, etudes, visites] = await Promise.all([
    tousLesEcarts({ etudeId, statut: params.statut, gravite: params.gravite }),
    listerEtudes(),
    visitesPourChoix(),
  ]);

  const ouverts = lignes.filter((l) => l.ecart.statut !== "clos");
  const critiques = ouverts.filter((l) => l.ecart.gravite === "critique");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Écarts et déviations</h1>
          <p className="mt-1 text-sm text-attenue">
            {lignes.length} écart{lignes.length > 1 ? "s" : ""} · {ouverts.length} ouvert
            {ouverts.length > 1 ? "s" : ""}
            {critiques.length > 0 && (
              <span className="text-alerte"> · {critiques.length} critique{critiques.length > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <FormulaireEcart etudes={etudes} visites={visites} libelle="Nouvel écart" />
      </header>

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-40 flex-1">
          <label htmlFor="etude" className="mb-1.5 block text-xs text-attenue">
            Étude
          </label>
          <select id="etude" name="etude" defaultValue={params.etude ?? ""} className="champ">
            <option value="">Toutes</option>
            {etudes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label htmlFor="gravite" className="mb-1.5 block text-xs text-attenue">
            Gravité
          </label>
          <select id="gravite" name="gravite" defaultValue={params.gravite ?? ""} className="champ">
            <option value="">Toutes</option>
            {Object.entries(GRAVITES_ECART).map(([cle, l]) => (
              <option key={cle} value={cle}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label htmlFor="statut" className="mb-1.5 block text-xs text-attenue">
            Statut
          </label>
          <select id="statut" name="statut" defaultValue={params.statut ?? ""} className="champ">
            <option value="">Tous</option>
            {Object.entries(STATUTS_ECART).map(([cle, l]) => (
              <option key={cle} value={cle}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
      </form>

      <TableauEcarts
        lignes={lignes}
        etudes={etudes}
        visites={visites}
        message="Aucun écart ne correspond. C'est plutôt bon signe."
      />
    </div>
  );
}
