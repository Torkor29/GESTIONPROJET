import Link from "next/link";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireFaq from "@/components/formulaire-faq";
import FormulairePenseBete from "@/components/formulaire-pense-bete";
import FormulaireTache from "@/components/formulaire-tache";
import PersonnaliserAccueil from "@/components/personnaliser-accueil";
import RappelInclusion from "@/components/rappel-inclusion";
import TableauMissions from "@/components/tableau-missions";
import ListeEcheances from "@/components/liste-echeances";
import MenuCreer from "@/components/menu-creer";
import type { Echeance } from "@/lib/echeances";
import { couleurAffichee } from "@/lib/couleurs";
import {
  STATUTS_CONVENTION_OUVERTS,
  STATUTS_VISITE_OUVERTS,
  TYPES_CONVENTION,
  TYPES_VISITE,
} from "@/lib/constantes";
import { VueParEtude, VueParType } from "@/components/vues-missions";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { Icone, type NomIcone } from "@/components/icones";
import { lireWidgetsAccueil, widgetVisible } from "@/lib/accueil";
import { debutDeSemaine, formaterDuree, sigleEtude } from "@/lib/format";
import { missionsATraiter } from "@/lib/priorite";
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
  toutesLesConventions,
  toutesLesTaches,
  toutesLesVisites,
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

const ORGANISATIONS = [
  { cle: "etude", libelle: "Par étude" },
  { cle: "mission", libelle: "Par mission" },
  { cle: "type", libelle: "Par type" },
] as const;

export default async function TableauDeBord({
  searchParams,
}: {
  searchParams: Promise<{ organisation?: string }>;
}) {
  const { organisation = "etude" } = await searchParams;
  const maintenant = Math.floor(Date.now() / 1000);
  const compte = await utilisateurActuel();
  const widgets = lireWidgetsAccueil(compte?.accueil);
  const voir = (cle: string) => widgetVisible(widgets, cle);

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
  const [visites, conventions] = voir("timeline")
    ? await Promise.all([toutesLesVisites(), toutesLesConventions()])
    : [[], []];

  const aTraiter = missionsATraiter(missions, maintenant);

  // Le suivi organisable ne sert qu'à qui porte des missions transverses :
  // pour les autres, il doublerait « À traiter ».
  const enCours = missions.filter((m) => m.tache.statut !== "terminee");
  const suiviUtile =
    Boolean(compte?.accesToutesEtudes) || missions.some((m) => m.etudesLiees.length > 1);
  const droits = {
    utilisateurId: compte?.id,
    pilote: compte?.accesToutesEtudes,
    niveauxPartage: niveaux,
  };

  // Moyenne de conformité sur les seules études qui ont une checklist.
  const avecChecklist = [...progressions.values()].filter((p) => p.total > 0);
  const conformiteMoyenne =
    avecChecklist.length === 0
      ? null
      : Math.round(
          avecChecklist.reduce((t, p) => t + p.pourcentage, 0) / avecChecklist.length,
        );

  const maxMinutes = Math.max(1, ...repartition.map((r) => r.minutes));
  const echeances: Echeance[] = voir("timeline")
    ? [
        ...missions
          .filter((m) => m.tache.statut !== "terminee" && m.tache.echeance)
          .map((m) => ({
            cle: `m${m.tache.id}`,
            nature: "mission" as const,
            titre: m.tache.titre,
            detail: m.assigneNom ?? null,
            date: m.tache.echeance!,
            href: `/missions?q=${encodeURIComponent(m.tache.titre)}`,
            etude: m.etudeCode ?? m.etudeNom,
            couleur: couleurAffichee(m.tache.couleur, m.etudeCouleur),
          })),
        ...visites
          .filter(
            (v) =>
              v.visite.datePrevue &&
              !v.visite.dateRealisee &&
              STATUTS_VISITE_OUVERTS.includes(v.visite.statut),
          )
          .map((v) => ({
            cle: `v${v.visite.id}`,
            nature: "visite" as const,
            titre: TYPES_VISITE[v.visite.type] ?? "Visite",
            detail: v.visite.centre,
            date: v.visite.datePrevue!,
            href: "/visites",
            etude: v.etudeCode ?? v.etudeNom,
            couleur: v.etudeCouleur,
          })),
        ...conventions
          .filter(
            (c) =>
              c.convention.dateEcheance &&
              STATUTS_CONVENTION_OUVERTS.includes(c.convention.statut),
          )
          .map((c) => ({
            cle: `c${c.convention.id}`,
            nature: "convention" as const,
            titre: `${TYPES_CONVENTION[c.convention.type] ?? "Convention"}${c.convention.reference ? ` ${c.convention.reference}` : ""}`,
            detail: c.convention.partie,
            date: c.convention.dateEcheance!,
            href: "/budget",
            etude: c.etudeCode ?? c.etudeNom,
            couleur: c.etudeCouleur,
          })),
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="anime-bloc entete-page">
        <div>
          <p className="sur-titre">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1">
            {compte ? `Bonjour ${compte.nom.split(/\s+/)[0]}` : "Tableau de bord"}
          </h1>
        </div>
        {/* Les ajouts rapides vivent dans l'en-tête : une carte entière pour
            quatre boutons repoussait le contenu utile sous la ligne de flottaison. */}
        <div className="flex flex-wrap items-center gap-2">
          <PersonnaliserAccueil actifs={widgets} compact />
          {voir("ajouts") && (
            <>
              {/* Les ajouts secondaires se rangent derrière « Créer » : la
                  mission, la plus fréquente, reste à un clic. */}
              <MenuCreer>
                <FormulaireEtude libelle="Nouvelle étude" variante="discret" />
                <FormulairePenseBete etudes={etudes} libelle="Nouvelle note" variante="discret" />
                <FormulaireFaq etudes={etudes} libelle="Nouvelle question" variante="discret" />
              </MenuCreer>
              <FormulaireTache
                etudes={etudes}
                libelle="Nouvelle mission"
                membres={membres}
                comptes={comptes}
                peutAttribuer
              />
            </>
          )}
        </div>
      </header>

      {widgets.length === 0 && (
        <div className="carte p-8 text-center">
          <p className="font-titre text-lg font-bold">Accueil rangé</p>
          <p className="mt-1 text-sm text-attenue">
            Toutes les vues sont masquées. Ramenez celles dont vous avez besoin.
          </p>
        </div>
      )}

      {voir("chiffres") && (
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
      )}

      {voir("timeline") && (
        <section className="bloc-app anime-bloc">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-titre text-xl font-bold">Échéances</h2>
            <p className="text-xs text-attenue">missions, visites et conventions · 8 semaines</p>
          </div>
          <ListeEcheances
            echeances={echeances}
            maintenant={maintenant}
            limiteJours={56}
            afficherEtude
            vide="Aucune échéance dans les huit prochaines semaines."
          />
        </section>
      )}

      {voir("inclusion") && <RappelInclusion lignes={lignesRappelInclusion(etudes)} />}

      {voir("priorite") && (
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
            lignes={aTraiter}
            etudes={etudes}
            message="Rien d'urgent : pas de mission importante, ni d'échéance dans les trois semaines. Les missions peu importantes n'apparaissent pas ici."
            membres={membres}
            comptes={comptes}
            utilisateurId={compte?.id}
            pilote={compte?.accesToutesEtudes}
            niveauxPartage={niveaux}
          />
        </section>
      )}

      {voir("suivi") && suiviUtile && (
        <section className="bloc-app anime-bloc">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-titre text-xl font-bold">Suivi des missions en cours</h2>
            <nav className="segments" aria-label="Organisation du suivi">
              {ORGANISATIONS.map((o) => (
                <Link
                  key={o.cle}
                  href={`/bord?organisation=${o.cle}`}
                  scroll={false}
                  aria-current={organisation === o.cle ? "page" : undefined}
                  className="segment"
                >
                  {o.libelle}
                </Link>
              ))}
            </nav>
          </div>

          {organisation === "mission" ? (
            <TableauMissions
              lignes={enCours}
              etudes={etudes}
              message="Aucune mission en cours."
              membres={membres}
              comptes={comptes}
              {...droits}
            />
          ) : organisation === "type" ? (
            <VueParType
              missions={enCours}
              etudes={etudes}
              membres={membres}
              comptes={comptes}
              message="Aucune mission en cours."
              {...droits}
            />
          ) : (
            <VueParEtude
              missions={enCours}
              masquerTerminees
              message="Aucune mission en cours."
              {...droits}
            />
          )}
        </section>
      )}

      {voir("projets") && (
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
      )}

      {voir("temps") && (
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
          {repartition.length === 0 ? (
            <p className="text-sm text-attenue">Aucun temps saisi cette semaine.</p>
          ) : (
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
                      <span className="truncate" title={r.nom !== sigleEtude(r) ? r.nom : undefined}>
                        {sigleEtude(r)}
                      </span>
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
          )}
        </section>
      )}
    </div>
  );
}
