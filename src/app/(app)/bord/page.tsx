import Link from "next/link";
import { creerPage } from "@/actions/pages";
import FormulaireDocument from "@/components/formulaire-document";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireFaq from "@/components/formulaire-faq";
import FormulaireTache from "@/components/formulaire-tache";
import RappelInclusion from "@/components/rappel-inclusion";
import TableauMissions from "@/components/tableau-missions";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { Icone, type NomIcone } from "@/components/icones";
import { debutDeSemaine, formaterDuree } from "@/lib/format";
import { lignesRappelInclusion } from "@/lib/inclusion";
import { lireReglementations, referentiel } from "@/lib/referentiels";
import { utilisateurActuel } from "@/lib/auth";
import { comptesDisponibles } from "@/actions/partages";
import {
  listerEtudes,
  membresPourAttribution,
  niveauxPartage,
  progressionParEtude,
  statistiques,
  totauxParEtude,
  toutesLesTaches,
} from "@/lib/requetes";

export const dynamic = "force-dynamic";

function Chiffre({
  libelle,
  valeur,
  detail,
  alerte,
  icone,
  href,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  alerte?: boolean;
  icone: NomIcone;
  href?: string;
}) {
  const contenu = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="sur-titre">{libelle}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            alerte ? "bg-alerte-voile text-alerte" : "bg-accent-voile text-accent-appuye"
          }`}
        >
          <Icone nom={icone} className="h-4 w-4" />
        </span>
      </div>
      <p
        className={`chiffres mt-2 font-titre text-3xl font-bold ${alerte ? "text-alerte" : ""}`}
      >
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-attenue">{detail}</p>}
    </>
  );

  return href ? (
    <Link href={href} className="carte-active p-5">
      {contenu}
    </Link>
  ) : (
    <div className="carte p-5">{contenu}</div>
  );
}

export default async function TableauDeBord() {
  const maintenant = Math.floor(Date.now() / 1000);
  const compte = await utilisateurActuel();

  const [stats, etudes, missions, repartition, progressions, membres, comptes, niveaux] = await Promise.all([
    statistiques(),
    listerEtudes(),
    toutesLesTaches(),
    totauxParEtude({ du: debutDeSemaine(maintenant) }),
    progressionParEtude(),
    membresPourAttribution(),
    compte ? comptesDisponibles(compte.id) : Promise.resolve([]),
    niveauxPartage(),
  ]);

  const dansUneSemaine = maintenant + 7 * 86400;
  const ouvertes = missions.filter(({ tache }) => tache.statut !== "terminee");
  const rangPriorite: Record<string, number> = { haute: 0, normale: 1, basse: 2 };
  const urgentes = ouvertes
    .filter(({ tache }) => tache.echeance && tache.echeance <= dansUneSemaine)
    .sort((a, b) => (a.tache.echeance ?? 0) - (b.tache.echeance ?? 0));
  const aTraiter =
    urgentes.length > 0
      ? urgentes
      : [...ouvertes].sort(
          (a, b) => (rangPriorite[a.tache.priorite] ?? 1) - (rangPriorite[b.tache.priorite] ?? 1),
        );

  // Moyenne de conformité sur les seules études qui ont une checklist.
  const avecChecklist = [...progressions.values()].filter((p) => p.total > 0);
  const conformiteMoyenne =
    avecChecklist.length === 0
      ? null
      : Math.round(
          avecChecklist.reduce((t, p) => t + p.pourcentage, 0) / avecChecklist.length,
        );

  const maxMinutes = Math.max(1, ...repartition.map((r) => r.minutes));

  return (
    <div className="space-y-6">
      <header className="anime-bloc">
        <p className="sur-titre">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-1.5 font-titre text-3xl font-bold">Tableau de bord</h1>
      </header>

      {/* --------------------------------------------------- Ajouts rapides */}
      <section className="bloc-app anime-bloc">
        <h2 className="sur-titre mb-4">Ajouts rapides</h2>
        <div className="flex flex-wrap gap-2">
          <FormulaireTache
            etudes={etudes}
            libelle="Nouvelle mission"
            variante="discret"
            membres={membres}
            comptes={comptes}
            peutAttribuer
          />
          <FormulaireDocument etudes={etudes} libelle="Nouveau document" variante="discret" />
          <FormulaireFaq etudes={etudes} libelle="Nouvelle question" variante="discret" />
          <form action={creerPage}>
            <button type="submit" className="bouton-discret">
              Nouvelle page
            </button>
          </form>
          <FormulaireEtude libelle="Nouvelle étude" variante="discret" />
        </div>
      </section>

      {/* --------------------------------------------------------- Chiffres */}
      <div className="anime-bloc grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Chiffre
          libelle="Missions ouvertes"
          valeur={String(stats.tachesOuvertes)}
          detail={stats.tachesEnRetard > 0 ? `dont ${stats.tachesEnRetard} en retard` : "à jour"}
          alerte={stats.tachesEnRetard > 0}
          icone="drapeau"
          href="/missions?masquerTerminees=1"
        />
        <Chiffre
          libelle="Conformité moyenne"
          valeur={conformiteMoyenne === null ? "—" : `${conformiteMoyenne} %`}
          detail={
            conformiteMoyenne === null
              ? "aucune checklist active"
              : `sur ${avecChecklist.length} étude(s)`
          }
          icone="checklist"
        />
        <Chiffre
          libelle="Cette semaine"
          valeur={formaterDuree(stats.minutesSemaine)}
          detail="temps saisi"
          icone="chrono"
          href="/temps?periode=semaine"
        />
        <Chiffre
          libelle="Études actives"
          valeur={String(stats.etudesActives)}
          detail={`${etudes.length} au total`}
          icone="dossier"
          href="/etudes"
        />
      </div>

      <RappelInclusion lignes={lignesRappelInclusion(etudes)} />

      {/* --------------------------------------------------- Missions du jour */}
      <section className="bloc-app anime-bloc">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-titre text-xl font-bold">À traiter en priorité</h2>
          <Link
            href="/missions"
            className="text-sm font-medium text-accent transition-opacity hover:opacity-70"
          >
            Toutes les missions
          </Link>
        </div>
        <TableauMissions
          lignes={aTraiter.slice(0, 10)}
          etudes={etudes}
          message="Aucune mission ouverte. Vous êtes à jour."
          membres={membres}
          comptes={comptes}
          utilisateurId={compte?.id}
          niveauxPartage={niveaux}
        />
      </section>

      {/* ---------------------------------------------------------- Projets */}
      <section className="bloc-app anime-bloc">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-titre text-xl font-bold">Projets</h2>
          <Link
            href="/etudes"
            className="text-sm font-medium text-accent transition-opacity hover:opacity-70"
          >
            Tout voir
          </Link>
        </div>

        {etudes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ligne bg-creux/40 p-10 text-center">
            <p className="text-sm text-attenue">Aucune étude pour l&apos;instant.</p>
            <div className="mt-4 inline-flex">
              <FormulaireEtude libelle="Créer ma première étude" />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {etudes.slice(0, 6).map((e) => {
              const prog = progressions.get(e.id);
              const type = lireReglementations(e.reglementations)
                .map((c) => referentiel(c))
                .find((r) => r?.categorie === "type");

              return (
                <Link
                  key={e.id}
                  href={`/etudes/${e.id}`}
                  className="carte-active overflow-hidden"
                >
                  {e.imageCouverture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.imageCouverture} alt="" className="h-24 w-full object-cover" />
                  ) : (
                    <div
                      className="h-24 w-full"
                      style={{
                        background: `linear-gradient(135deg, ${e.couleur}33, ${e.couleur}0d)`,
                      }}
                    />
                  )}
                  <div className="p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                          style={{ backgroundColor: e.couleur }}
                        />
                        {e.code && (
                          <span className="truncate text-xs font-bold tracking-tight text-attenue">
                            {e.code}
                          </span>
                        )}
                      </span>
                      <EtiquetteStatutEtude statut={e.statut} />
                    </div>
                    <p className="truncate font-titre text-sm font-bold">{e.nom}</p>
                    {type && (
                      <p className="mt-1.5 truncate text-xs text-attenue">
                        {type.nom.split("—")[0].trim()}
                      </p>
                    )}
                    {prog && prog.total > 0 && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-creux">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${prog.pourcentage}%`,
                            backgroundColor: e.couleur,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ Temps */}
      {repartition.length > 0 && (
        <section className="bloc-app anime-bloc">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-titre text-lg font-bold">Temps de la semaine</h2>
            <Link
              href="/temps"
              className="text-sm font-medium text-accent transition-opacity hover:opacity-70"
            >
              Détail
            </Link>
          </div>
          <ul className="space-y-3">
            {repartition.map((r) => (
              <li key={r.etudeId}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  {/* `min-w-0` est indispensable : sans lui, un élément de
                      flexbox refuse de descendre sous la largeur de son
                      contenu, `truncate` n'opère pas, et un nom d'étude long
                      pousse la durée hors de l'écran. */}
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                      style={{ backgroundColor: r.couleur }}
                    />
                    <span className="truncate">{r.nom}</span>
                  </span>
                  <span className="chiffres shrink-0 text-sm font-medium">
                    {formaterDuree(r.minutes)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-creux">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(r.minutes / maxMinutes) * 100}%`,
                      backgroundColor: r.couleur,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
