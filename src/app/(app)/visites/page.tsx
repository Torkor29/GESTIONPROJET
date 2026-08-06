import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { STATUTS_VISITE, STATUTS_VISITE_OUVERTS } from "@/lib/constantes";
import { listerEtudes, toutesLesVisites } from "@/lib/requetes";
import FormulaireVisite from "@/components/formulaire-visite";
import TableauVisites from "@/components/tableau-visites";

export const dynamic = "force-dynamic";

export default async function PageVisites({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; statut?: string }>;
}) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [lignes, etudes] = await Promise.all([
    toutesLesVisites({ etudeId, statut: params.statut }),
    listerEtudes(),
  ]);

  const maintenant = Math.floor(Date.now() / 1000);
  const ouvertes = lignes.filter((l) => STATUTS_VISITE_OUVERTS.includes(l.visite.statut));
  const enRetard = ouvertes.filter(
    (l) => l.visite.datePrevue && l.visite.datePrevue < maintenant && !l.visite.dateRealisee,
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Visites de monitorage</h1>
          <p className="mt-1 text-sm text-attenue">
            {lignes.length} visite{lignes.length > 1 ? "s" : ""} · {ouvertes.length} en cours
            {enRetard.length > 0 && (
              <span className="text-alerte"> · {enRetard.length} en retard</span>
            )}
          </p>
        </div>
        <FormulaireVisite etudes={etudes} libelle="Nouvelle visite" />
      </header>

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-44 flex-1">
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

        <div className="min-w-44 flex-1">
          <label htmlFor="statut" className="mb-1.5 block text-xs text-attenue">
            Statut
          </label>
          <select id="statut" name="statut" defaultValue={params.statut ?? ""} className="champ">
            <option value="">Tous</option>
            {Object.entries(STATUTS_VISITE).map(([cle, l]) => (
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

      <TableauVisites
        lignes={lignes}
        etudes={etudes}
        message="Aucune visite ne correspond. Créez-en une pour commencer à planifier."
      />
    </div>
  );
}
