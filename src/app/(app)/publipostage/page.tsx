import Link from "next/link";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import {
  STATUTS_PUBLIPOSTAGE,
  STATUTS_PUBLIPOSTAGE_A_TRAITER,
  STATUTS_PUBLIPOSTAGE_EN_ATTENTE,
} from "@/lib/constantes";
import { SECONDES_PAR_JOUR } from "@/lib/format";
import { MODELES_PUBLIPOSTAGE } from "@/lib/publipostage";
import { listerEtudes, tousLesPublipostages } from "@/lib/requetes";
import FormulaireNouveauPublipostage from "@/components/formulaire-nouveau-publipostage";
import MenuExport from "@/components/menu-export";
import { JOURS_AVANT_RELANCE } from "@/components/statuts-publipostage";
import TableauPublipostages from "@/components/tableau-publipostages";
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
  valeur: number;
  detail: string;
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
      <p className="mt-0.5 text-xs text-attenue">{detail}</p>
    </div>
  );
}

export default async function PagePublipostage({
  searchParams,
}: {
  searchParams: Promise<{ etude?: string; modele?: string; statut?: string }>;
}) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const params = await searchParams;
  const etudeId = params.etude ? Number(params.etude) : null;

  const [lignes, etudes] = await Promise.all([
    tousLesPublipostages({ etudeId, modele: params.modele, statut: params.statut }),
    listerEtudes(),
  ]);

  const maintenant = Math.floor(Date.now() / 1000);
  const aTraiter = lignes.filter((l) =>
    STATUTS_PUBLIPOSTAGE_A_TRAITER.includes(l.publipostage.statut),
  );
  const chezLeCoordo = lignes.filter((l) =>
    STATUTS_PUBLIPOSTAGE_EN_ATTENTE.includes(l.publipostage.statut),
  );
  const aRelancer = chezLeCoordo.filter(
    (l) =>
      l.publipostage.envoyeLe &&
      maintenant - l.publipostage.envoyeLe >= JOURS_AVANT_RELANCE * SECONDES_PAR_JOUR,
  );
  const aboutis = lignes.filter((l) => ["valide", "signe"].includes(l.publipostage.statut));

  const filtres = Object.fromEntries(
    Object.entries({
      etude: params.etude ?? "",
      modele: params.modele ?? "",
      statut: params.statut ?? "",
    }).filter(([, v]) => v),
  ) as Record<string, string>;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Publipostage</h1>
          <p className="mt-1 text-sm text-attenue">
            Conventions et fiches de qualification : on complète les champs, on exporte en Word
            ou en PDF, et on suit le document jusqu&apos;au retour du coordo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MenuExport base="/api/export-publipostage" parametres={filtres} />
          <FormulaireNouveauPublipostage etudes={etudes} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Chiffre
          libelle="À préparer ou corriger"
          valeur={aTraiter.length}
          detail="brouillons, prêts à envoyer, corrections demandées"
          icone="page"
        />
        <Chiffre
          libelle="Chez le coordo"
          valeur={chezLeCoordo.length}
          detail={
            aRelancer.length > 0
              ? `dont ${aRelancer.length} sans retour depuis ${JOURS_AVANT_RELANCE} jours ou plus`
              : "envoyés, en attente de retour"
          }
          alerte={aRelancer.length > 0}
          icone="chrono"
        />
        <Chiffre
          libelle="Validés ou signés"
          valeur={aboutis.length}
          detail="circuit terminé"
          icone="checklist"
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
                {e.code ? `${e.code} — ${e.nom}` : e.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-44 flex-1">
          <label htmlFor="modele" className="mb-1.5 block text-xs text-attenue">
            Modèle
          </label>
          <select id="modele" name="modele" defaultValue={params.modele ?? ""} className="champ">
            <option value="">Tous</option>
            {MODELES_PUBLIPOSTAGE.map((m) => (
              <option key={m.cle} value={m.cle}>
                {m.nom}
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
            {Object.entries(STATUTS_PUBLIPOSTAGE).map(([cle, l]) => (
              <option key={cle} value={cle}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
        {Object.keys(filtres).length > 0 && (
          <Link href="/publipostage" className="pb-2 text-sm text-attenue hover:text-encre">
            Réinitialiser
          </Link>
        )}
      </form>

      <TableauPublipostages
        lignes={lignes}
        message={
          Object.keys(filtres).length > 0
            ? "Aucun document ne correspond à ces filtres."
            : "Aucun document pour l'instant. Cliquez sur « Nouveau document » et choisissez une trame."
        }
      />
    </div>
  );
}
