import Link from "next/link";
import { EtiquettePriorite, PastilleEtude } from "@/components/etiquettes";
import { formaterDate, formaterDuree } from "@/lib/format";
import { listerEtudes, statistiques, totauxParEtude, toutesLesTaches } from "@/lib/requetes";
import { debutDeSemaine } from "@/lib/format";

export const dynamic = "force-dynamic";

function Chiffre({
  libelle,
  valeur,
  detail,
  alerte,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  alerte?: boolean;
}) {
  return (
    <div className="carte p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{libelle}</p>
      <p
        className={`chiffres mt-1.5 text-2xl font-semibold ${alerte ? "text-red-500" : ""}`}
      >
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export default async function TableauDeBord() {
  const maintenant = Math.floor(Date.now() / 1000);

  const [stats, etudes, taches, repartition] = await Promise.all([
    statistiques(),
    listerEtudes(),
    toutesLesTaches(),
    totauxParEtude({ du: debutDeSemaine(maintenant) }),
  ]);

  const aTraiter = taches.filter((t) => t.tache.statut !== "terminee").slice(0, 8);
  const maxMinutes = Math.max(1, ...repartition.map((r) => r.minutes));

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Chiffre
          libelle="Cette semaine"
          valeur={formaterDuree(stats.minutesSemaine)}
          detail="temps saisi"
        />
        <Chiffre
          libelle="Ce mois-ci"
          valeur={formaterDuree(stats.minutesMois)}
          detail="temps saisi"
        />
        <Chiffre
          libelle="Études actives"
          valeur={String(stats.etudesActives)}
          detail={`${etudes.length} au total`}
        />
        <Chiffre
          libelle="Tâches ouvertes"
          valeur={String(stats.tachesOuvertes)}
          detail={stats.tachesEnRetard > 0 ? `dont ${stats.tachesEnRetard} en retard` : "à jour"}
          alerte={stats.tachesEnRetard > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="carte p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">À faire</h2>
            <Link href="/taches" className="text-sm text-accent hover:underline">
              Tout voir
            </Link>
          </div>

          {aTraiter.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Rien en attente. Bonne nouvelle.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {aTraiter.map(({ tache, etudeNom, etudeCouleur }) => {
                const enRetard = tache.echeance && tache.echeance < maintenant;
                return (
                  <li key={tache.id} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: etudeCouleur ?? "#a8a29e" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{tache.titre}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                        {etudeNom && <span className="truncate">{etudeNom}</span>}
                        {tache.echeance && (
                          <span className={enRetard ? "font-medium text-red-500" : ""}>
                            {enRetard ? "en retard — " : ""}
                            {formaterDate(tache.echeance)}
                          </span>
                        )}
                        <EtiquettePriorite priorite={tache.priorite} />
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="carte p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Temps de la semaine</h2>
            <Link href="/temps" className="text-sm text-accent hover:underline">
              Détail
            </Link>
          </div>

          {repartition.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Aucun temps saisi cette semaine.
            </p>
          ) : (
            <ul className="space-y-3">
              {repartition.map((r) => (
                <li key={r.etudeId}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <PastilleEtude couleur={r.couleur} nom={r.nom} />
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
          )}
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Mes études</h2>
          <Link href="/etudes" className="text-sm text-accent hover:underline">
            Tout voir
          </Link>
        </div>

        {etudes.length === 0 ? (
          <div className="carte p-8 text-center">
            <p className="text-sm text-muted">Aucune étude pour l&apos;instant.</p>
            <Link href="/etudes" className="bouton mt-4">
              Créer ma première étude
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {etudes.slice(0, 6).map((e) => (
              <Link
                key={e.id}
                href={`/etudes/${e.id}`}
                className="carte p-4 transition hover:border-accent/50"
              >
                <PastilleEtude couleur={e.couleur} nom={e.nom} />
                {e.client && <p className="mt-1 truncate text-xs text-muted">{e.client}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
