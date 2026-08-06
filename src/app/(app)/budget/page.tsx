import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { STATUTS_CONVENTION, STATUTS_CONVENTION_OUVERTS } from "@/lib/constantes";
import { formaterMontant } from "@/lib/format";
import { conventionsPourChoix, listerEtudes, toutesLesConventions } from "@/lib/requetes";
import FormulaireConvention from "@/components/formulaire-convention";
import TableauConventions from "@/components/tableau-conventions";
import { Icone, type NomIcone } from "@/components/icones";

export const dynamic = "force-dynamic";

function Chiffre({
  libelle,
  valeur,
  detail,
  icone,
  alerte,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  icone: NomIcone;
  alerte?: boolean;
}) {
  return (
    <div className="carte p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="sur-titre">{libelle}</p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            alerte ? "bg-alerte-voile text-alerte" : "bg-accent-voile text-accent-appuye"
          }`}
        >
          <Icone nom={icone} className="h-4 w-4" />
        </span>
      </div>
      <p className={`chiffres mt-2 font-titre text-2xl font-bold ${alerte ? "text-alerte" : ""}`}>
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-attenue">{detail}</p>}
    </div>
  );
}

export default async function PageBudget({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; statut?: string }>;
}) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [lignes, etudes, parents] = await Promise.all([
    toutesLesConventions({ etudeId, statut: params.statut }),
    listerEtudes(),
    conventionsPourChoix(),
  ]);

  const maintenant = Math.floor(Date.now() / 1000);

  // Les conventions annulées sortent des totaux : les compter fausserait le
  // budget prévu comme le reste à percevoir.
  const comptees = lignes.filter((l) => l.convention.statut !== "annulee");
  const total = comptees.reduce((t, l) => t + (l.convention.montantTotal ?? 0), 0);
  const percu = comptees.reduce((t, l) => t + l.convention.montantRecu, 0);
  const reste = total - percu;

  const enRetard = comptees.filter((l) => {
    const c = l.convention;
    const restant = (c.montantTotal ?? 0) - c.montantRecu;
    return (
      STATUTS_CONVENTION_OUVERTS.includes(c.statut) &&
      c.dateEcheance &&
      c.dateEcheance < maintenant &&
      restant > 0
    );
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Budget et conventions</h1>
          <p className="mt-1 text-sm text-attenue">
            {lignes.length} contrat{lignes.length > 1 ? "s" : ""}
            {enRetard.length > 0 && (
              <span className="text-alerte">
                {" "}
                · {enRetard.length} échéance{enRetard.length > 1 ? "s" : ""} dépassée
                {enRetard.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <FormulaireConvention etudes={etudes} parents={parents} libelle="Nouvelle convention" />
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Chiffre
          libelle="Budget contractualisé"
          valeur={formaterMontant(total)}
          detail={`${comptees.length} contrat${comptees.length > 1 ? "s" : ""}, hors annulés`}
          icone="document"
        />
        <Chiffre
          libelle="Déjà perçu"
          valeur={formaterMontant(percu)}
          detail={total > 0 ? `${Math.round((percu / total) * 100)} % du budget` : "—"}
          icone="graphique"
        />
        <Chiffre
          libelle="Reste à percevoir"
          valeur={formaterMontant(reste)}
          detail={
            enRetard.length > 0
              ? `dont ${enRetard.length} échéance${enRetard.length > 1 ? "s" : ""} dépassée${enRetard.length > 1 ? "s" : ""}`
              : "aucune échéance dépassée"
          }
          alerte={enRetard.length > 0}
          icone="eclair"
        />
      </div>

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
            {Object.entries(STATUTS_CONVENTION).map(([cle, l]) => (
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

      <TableauConventions
        lignes={lignes}
        etudes={etudes}
        parents={parents}
        message="Aucune convention ne correspond."
      />
    </div>
  );
}
