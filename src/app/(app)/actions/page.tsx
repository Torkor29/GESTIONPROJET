import Link from "next/link";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { STATUTS_ACTION, STATUTS_ACTION_OUVERTS } from "@/lib/constantes";
import { ecartsPourChoix, listerEtudes, toutesLesActions } from "@/lib/requetes";
import FormulaireAction from "@/components/formulaire-action";
import TableauActions from "@/components/tableau-actions";

export const dynamic = "force-dynamic";

export default async function PageActions({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; statut?: string; ecart?: string }>;
}) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;
  const ecartId = params.ecart ? Number(params.ecart) : null;

  const [lignes, etudes, ecarts] = await Promise.all([
    toutesLesActions({ etudeId, statut: params.statut, ecartId }),
    listerEtudes(),
    ecartsPourChoix(),
  ]);

  const maintenant = Math.floor(Date.now() / 1000);
  const ouvertes = lignes.filter((l) => STATUTS_ACTION_OUVERTS.includes(l.action.statut));
  const enRetard = ouvertes.filter((l) => l.action.echeance && l.action.echeance < maintenant);

  // Le filtre par écart arrive depuis la liste des écarts : on nomme l'écart
  // plutôt que d'afficher un identifiant, et on offre la sortie du filtre.
  const ecartFiltre = ecartId ? ecarts.find((e) => e.id === ecartId) : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Actions correctives</h1>
          <p className="mt-1 text-sm text-attenue">
            {lignes.length} action{lignes.length > 1 ? "s" : ""} · {ouvertes.length} à traiter
            {enRetard.length > 0 && (
              <span className="text-alerte"> · {enRetard.length} en retard</span>
            )}
          </p>
        </div>
        <FormulaireAction
          etudes={etudes}
          ecarts={ecarts}
          ecartIdParDefaut={ecartId ?? undefined}
          libelle="Nouvelle action"
        />
      </header>

      {ecartFiltre && (
        <div className="carte flex flex-wrap items-center justify-between gap-3 border-accent/30 bg-accent-voile/30 p-4">
          <p className="text-sm">
            Actions rattachées à{" "}
            <strong className="font-semibold">
              {ecartFiltre.reference ? `${ecartFiltre.reference} — ` : ""}
              {ecartFiltre.titre}
            </strong>
          </p>
          <Link href="/actions" className="bouton-discret !py-2 text-xs">
            Voir toutes les actions
          </Link>
        </div>
      )}

      <form method="get" className="sans-impression carte flex flex-wrap items-end gap-3 p-4">
        {ecartId && <input type="hidden" name="ecart" value={ecartId} />}

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
            {Object.entries(STATUTS_ACTION).map(([cle, l]) => (
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

      <TableauActions
        lignes={lignes}
        etudes={etudes}
        ecarts={ecarts}
        message="Aucune action ne correspond."
      />
    </div>
  );
}
