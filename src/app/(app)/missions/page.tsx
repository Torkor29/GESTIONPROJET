import Link from "next/link";
import FormulaireTache from "@/components/formulaire-tache";
import MenuExport from "@/components/menu-export";
import TableauMissions from "@/components/tableau-missions";
import ViderArchives from "@/components/vider-archives";
import { VueParEtude, VueParType } from "@/components/vues-missions";
import { LIBELLES_STATUT_LIGNE_MISSION, LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import { cleType } from "@/lib/missions";
import { utilisateurActuel } from "@/lib/auth";
import type { CompteChoix, MembreAttribution } from "@/lib/attribution";
import { comptesDisponibles } from "@/actions/partages";
import {
  listerEtudes,
  membresPourAttribution,
  niveauxPartage,
  toutesLesTaches,
  typesDeMission,
} from "@/lib/requetes";

export const dynamic = "force-dynamic";

const VUES = [
  { cle: "tableau", libelle: "Tableau" },
  { cle: "etude", libelle: "Par étude" },
  { cle: "type", libelle: "Par type" },
  { cle: "groupe", libelle: "Groupé par statut" },
  { cle: "echeances", libelle: "Par échéance" },
  { cle: "archives", libelle: "Archives" },
] as const;

type Params = {
  etude?: string;
  type?: string;
  statut?: string;
  q?: string;
  vue?: string;
  masquerTerminees?: string;
};

export default async function PageMissions({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const vue = params.vue ?? "tableau";
  const archives = vue === "archives";
  const maintenant = Math.floor(Date.now() / 1000);

  const [toutes, etudes, membres, compte, niveaux] = await Promise.all([
    toutesLesTaches(undefined, archives),
    listerEtudes(),
    membresPourAttribution(),
    utilisateurActuel(),
    niveauxPartage(),
  ]);
  const comptes = compte ? await comptesDisponibles(compte.id) : [];
  const typesConnus = typesDeMission(toutes);
  // La vue par étude filtre le statut étude par étude, pas mission par mission :
  // une mission « en cours » peut n'avoir pas démarré pour l'une de ses études.
  const statutParEtude = vue === "etude";

  const etudeId = params.etude ? Number(params.etude) : null;
  const recherche = (params.q ?? "").trim().toLowerCase();
  const masquerTerminees = params.masquerTerminees === "1";

  const lignes = toutes.filter(({ tache, sousTaches, etudesLiees }) => {
    if (etudeId) {
      const ids = (etudesLiees ?? []).map((e) => e.id);
      if (ids.length === 0 ? tache.etudeId !== etudeId : !ids.includes(etudeId)) return false;
    }
    if (params.type && cleType(tache.type) !== cleType(params.type)) return false;
    if (!archives && !statutParEtude && params.statut && tache.statut !== params.statut) return false;
    if (!archives && !statutParEtude && masquerTerminees && tache.statut === "terminee") return false;
    if (recherche) {
      const etapes = (sousTaches ?? []).map((s) => s.titre).join(" ");
      const texte = `${tache.titre} ${tache.notes ?? ""} ${etapes}`.toLowerCase();
      if (!texte.includes(recherche)) return false;
    }
    return true;
  });

  const enRetard = lignes.filter(
    ({ tache }) => tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant,
  );

  return (
    <div className="space-y-5">
      <header className="anime-bloc flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-3xl font-bold">Suivi de missions</h1>
          <p className="mt-1 text-sm text-attenue">
            {archives ? (
              <>
                {lignes.length} mission{lignes.length > 1 ? "s" : ""} archivée
                {lignes.length > 1 ? "s" : ""}. Elles restent pour le point,
                jusqu&apos;à ce que vous les vidiez.
              </>
            ) : (
              <>
                {lignes.length} mission{lignes.length > 1 ? "s" : ""} affichée
                {lignes.length > 1 ? "s" : ""}
                {enRetard.length > 0 && (
                  <span className="text-alerte"> · {enRetard.length} en retard</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MenuExport
            base="/api/export-missions"
            parametres={
              Object.fromEntries(
                Object.entries({
                  ...params,
                  ...(archives ? { archives: "1" } : {}),
                }).filter(([, v]) => v),
              ) as Record<string, string>
            }
          />
          {!archives && (
          <FormulaireTache
            etudes={etudes}
            libelle="Nouvelle mission"
            membres={membres}
            comptes={comptes}
            peutAttribuer
            typesConnus={typesConnus}
            etudeIdParDefaut={etudeId ?? undefined}
          />
          )}
        </div>
      </header>

      {/* Barre de vues */}
      <nav className="anime-bloc flex flex-wrap gap-2">
        {VUES.map((v) => {
          const q = new URLSearchParams(
            Object.entries(params).filter(([k, val]) => {
              if (!val || k === "vue") return false;
              if (v.cle === "archives" && (k === "masquerTerminees" || k === "statut")) return false;
              return true;
            }) as [string, string][],
          );
          q.set("vue", v.cle);
          return (
            <Link
              key={v.cle}
              href={`/missions?${q.toString()}`}
              aria-current={vue === v.cle ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm transition
                          ${
                            vue === v.cle
                              ? "border-accent bg-accent-voile font-medium text-accent-appuye shadow-posee"
                              : "border-ligne text-attenue hover:border-encre/30 hover:text-encre"
                          }`}
            >
              {v.libelle}
            </Link>
          );
        })}
      </nav>

      {/* Filtres */}
      <form method="get" className="sans-impression bloc-app anime-bloc flex flex-wrap items-end gap-3">
        <input type="hidden" name="vue" value={vue} />

        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="mb-1.5 block text-xs text-attenue">
            Rechercher
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Titre ou commentaire"
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

        {typesConnus.length > 0 && (
        <div className="min-w-40">
          <label htmlFor="type" className="mb-1.5 block text-xs text-attenue">
            Type
          </label>
          <select id="type" name="type" defaultValue={params.type ?? ""} className="champ">
            <option value="">Tous</option>
            {typesConnus.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        )}

        {!archives && (
        <div className="min-w-40">
          <label htmlFor="statut" className="mb-1.5 block text-xs text-attenue">
            Statut
          </label>
          <select id="statut" name="statut" defaultValue={params.statut ?? ""} className="champ">
            <option value="">Tous</option>
            {Object.entries(
              statutParEtude ? LIBELLES_STATUT_LIGNE_MISSION : LIBELLES_STATUT_MISSION,
            ).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        )}

        {!archives && (
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="masquerTerminees"
            value="1"
            defaultChecked={masquerTerminees}
            className="h-4 w-4 accent-indigo-600"
          />
          Masquer les terminées
        </label>
        )}

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
        {(params.q || params.etude || params.type || params.statut || masquerTerminees) && (
          <Link href={`/missions?vue=${vue}`} className="pb-2 text-sm text-attenue hover:text-encre">
            Réinitialiser
          </Link>
        )}
      </form>

      {archives && <ViderArchives />}

      {archives || vue === "tableau" ? (
        <TableauMissions
          lignes={lignes}
          etudes={etudes}
          message={
            archives
              ? "Aucune mission archivée."
              : "Aucune mission ne correspond à ces filtres."
          }
          membres={membres}
          comptes={comptes}
          utilisateurId={compte?.id}
          pilote={compte?.accesToutesEtudes}
          niveauxPartage={niveaux}
        />
      ) : vue === "etude" ? (
        <VueParEtude
          missions={lignes}
          etudeId={etudeId}
          statut={params.statut}
          masquerTerminees={masquerTerminees}
          message="Aucune mission ne correspond à ces filtres."
          utilisateurId={compte?.id}
          pilote={compte?.accesToutesEtudes}
          niveauxPartage={niveaux}
        />
      ) : vue === "type" ? (
        <VueParType
          missions={lignes}
          etudes={etudes}
          membres={membres}
          comptes={comptes}
          message="Aucune mission ne correspond à ces filtres."
          utilisateurId={compte?.id}
          pilote={compte?.accesToutesEtudes}
          niveauxPartage={niveaux}
        />
      ) : vue === "groupe" ? (
        <div className="space-y-5">
          {Object.entries(LIBELLES_STATUT_MISSION).map(([statut, libelle]) => {
            const duGroupe = lignes.filter((l) => l.tache.statut === statut);
            if (duGroupe.length === 0) return null;
            return (
              <section key={statut} className="bloc-app">
                <h2 className="mb-3 font-titre text-lg font-bold">
                  {libelle}
                  <span className="chiffres ml-2 text-sm font-normal text-attenue">{duGroupe.length}</span>
                </h2>
                <TableauMissions
                  lignes={duGroupe}
                  etudes={etudes}
                  membres={membres}
                  comptes={comptes}
                  utilisateurId={compte?.id}
                  pilote={compte?.accesToutesEtudes}
                  niveauxPartage={niveaux}
                />
              </section>
            );
          })}
        </div>
      ) : vue === "echeances" ? (
        <VueEcheances
          lignes={lignes}
          etudes={etudes}
          maintenant={maintenant}
          membres={membres}
          comptes={comptes}
          utilisateurId={compte?.id}
          pilote={compte?.accesToutesEtudes}
          niveauxPartage={niveaux}
        />
      ) : null}
    </div>
  );
}

/** Regroupe par urgence : en retard, cette semaine, plus tard, sans échéance. */
function VueEcheances({
  lignes,
  etudes,
  maintenant,
  membres,
  comptes,
  utilisateurId,
  pilote,
  niveauxPartage,
}: {
  lignes: Awaited<ReturnType<typeof toutesLesTaches>>;
  etudes: Awaited<ReturnType<typeof listerEtudes>>;
  maintenant: number;
  membres: MembreAttribution[];
  comptes: CompteChoix[];
  utilisateurId?: number;
  pilote?: boolean;
  niveauxPartage: Record<number, string>;
}) {
  const dansUneSemaine = maintenant + 7 * 86400;
  const ouvertes = lignes.filter((l) => l.tache.statut !== "terminee");

  const groupes = [
    {
      titre: "En retard",
      lignes: ouvertes.filter((l) => l.tache.echeance && l.tache.echeance < maintenant),
    },
    {
      titre: "Dans les 7 jours",
      lignes: ouvertes.filter(
        (l) =>
          l.tache.echeance && l.tache.echeance >= maintenant && l.tache.echeance <= dansUneSemaine,
      ),
    },
    {
      titre: "Plus tard",
      lignes: ouvertes.filter((l) => l.tache.echeance && l.tache.echeance > dansUneSemaine),
    },
    { titre: "Sans échéance", lignes: ouvertes.filter((l) => !l.tache.echeance) },
  ].filter((g) => g.lignes.length > 0);

  if (groupes.length === 0) {
    return <p className="carte p-8 text-center text-sm text-attenue">Aucune mission ouverte.</p>;
  }

  return (
    <div className="space-y-5">
      {groupes.map((g) => (
        <section key={g.titre} className="bloc-app">
          <h2 className="mb-3 font-titre text-lg font-bold">
            {g.titre}
            <span className="chiffres ml-2 text-sm font-normal text-attenue">{g.lignes.length}</span>
          </h2>
          <TableauMissions
            lignes={g.lignes}
            etudes={etudes}
            membres={membres}
            comptes={comptes}
            utilisateurId={utilisateurId}
            pilote={pilote}
            niveauxPartage={niveauxPartage}
          />
        </section>
      ))}
    </div>
  );
}
