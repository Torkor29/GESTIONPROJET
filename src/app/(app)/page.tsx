import Link from "next/link";
import { creerPage } from "@/actions/pages";
import FormulaireDocument from "@/components/formulaire-document";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireFaq from "@/components/formulaire-faq";
import FormulaireTache from "@/components/formulaire-tache";
import TableauMissions from "@/components/tableau-missions";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { debutDeSemaine, formaterDuree } from "@/lib/format";
import { lireReglementations, referentiel } from "@/lib/referentiels";
import {
  listerEtudes,
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
  href,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  alerte?: boolean;
  href?: string;
}) {
  const contenu = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{libelle}</p>
      <p className={`chiffres mt-1.5 text-2xl font-semibold ${alerte ? "text-red-500" : ""}`}>
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </>
  );

  return href ? (
    <Link href={href} className="carte p-4 transition hover:border-accent/50">
      {contenu}
    </Link>
  ) : (
    <div className="carte p-4">{contenu}</div>
  );
}

export default async function TableauDeBord() {
  const maintenant = Math.floor(Date.now() / 1000);

  const [stats, etudes, missions, repartition, progressions] = await Promise.all([
    statistiques(),
    listerEtudes(),
    toutesLesTaches(),
    totauxParEtude({ du: debutDeSemaine(maintenant) }),
    progressionParEtude(),
  ]);

  const dansUneSemaine = maintenant + 7 * 86400;
  const ouvertes = missions.filter(({ tache }) => tache.statut !== "terminee");
  const urgentes = ouvertes
    .filter(({ tache }) => tache.echeance && tache.echeance <= dansUneSemaine)
    .sort((a, b) => (a.tache.echeance ?? 0) - (b.tache.echeance ?? 0));

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
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* --------------------------------------------------- Ajouts rapides */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Ajouts rapides
        </h2>
        <div className="flex flex-wrap gap-2">
          <FormulaireTache etudes={etudes} libelle="✓ Nouvelle mission" variante="discret" />
          <FormulaireDocument etudes={etudes} libelle="📎 Nouveau document" variante="discret" />
          <FormulaireFaq etudes={etudes} libelle="💡 Nouvelle question" variante="discret" />
          <form action={creerPage}>
            <button type="submit" className="bouton-discret">
              📄 Nouvelle page
            </button>
          </form>
          <FormulaireEtude libelle="📁 Nouvelle étude" variante="discret" />
        </div>
      </section>

      {/* --------------------------------------------------------- Chiffres */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Chiffre
          libelle="Missions ouvertes"
          valeur={String(stats.tachesOuvertes)}
          detail={stats.tachesEnRetard > 0 ? `dont ${stats.tachesEnRetard} en retard` : "à jour"}
          alerte={stats.tachesEnRetard > 0}
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
        />
        <Chiffre
          libelle="Cette semaine"
          valeur={formaterDuree(stats.minutesSemaine)}
          detail="temps saisi"
          href="/temps?periode=semaine"
        />
        <Chiffre
          libelle="Études actives"
          valeur={String(stats.etudesActives)}
          detail={`${etudes.length} au total`}
          href="/etudes"
        />
      </div>

      {/* --------------------------------------------------- Missions du jour */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">À traiter en priorité</h2>
          <Link href="/missions" className="text-sm text-accent hover:underline">
            Toutes les missions
          </Link>
        </div>
        <TableauMissions
          lignes={urgentes.slice(0, 10)}
          etudes={etudes}
          message="Aucune échéance dans les 7 jours. Rien ne brûle."
        />
      </section>

      {/* ---------------------------------------------------------- Projets */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Projets</h2>
          <Link href="/etudes" className="text-sm text-accent hover:underline">
            Tout voir
          </Link>
        </div>

        {etudes.length === 0 ? (
          <div className="carte p-8 text-center">
            <p className="text-sm text-muted">Aucune étude pour l&apos;instant.</p>
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
                  className="carte overflow-hidden transition hover:border-accent/50"
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
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: e.couleur }}
                        />
                        {e.code && (
                          <span className="truncate text-xs font-semibold text-muted">
                            {e.code}
                          </span>
                        )}
                      </span>
                      <EtiquetteStatutEtude statut={e.statut} />
                    </div>
                    <p className="truncate text-sm font-medium">{e.nom}</p>
                    {type && (
                      <p className="mt-1.5 truncate text-xs text-muted">
                        {type.nom.split("—")[0].trim()}
                      </p>
                    )}
                    {prog && prog.total > 0 && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
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
        <section className="carte p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Temps de la semaine</h2>
            <Link href="/temps" className="text-sm text-accent hover:underline">
              Détail
            </Link>
          </div>
          <ul className="space-y-3">
            {repartition.map((r) => (
              <li key={r.etudeId}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: r.couleur }}
                    />
                    <span className="truncate">{r.nom}</span>
                  </span>
                  <span className="chiffres shrink-0 text-sm font-medium">
                    {formaterDuree(r.minutes)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
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
