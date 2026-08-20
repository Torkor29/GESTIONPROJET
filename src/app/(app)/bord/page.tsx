import Link from "next/link";
import { utilisateurActuel } from "@/lib/auth";
import {
  kpisGlobaux,
  listerQueries,
  listerSujets,
  listerVisitesSujet,
} from "@/lib/clinique";
import { STATUTS_VISITE_OUVERTS } from "@/lib/constantes";
import { listerEtudes, toutesLesTaches, toutesLesVisites } from "@/lib/requetes";
import { aPermission } from "@/lib/permissions";
import { queryOuverte } from "@/lib/queries-workflow";
import FormulaireEtude from "@/components/formulaire-etude";
import FormulaireTache from "@/components/formulaire-tache";
import { EntetePage, EtatVide, Kpi } from "@/components/ui";
import { EtiquetteStatutEtude } from "@/components/etiquettes";
import { formaterDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TableauDeBord() {
  const compte = await utilisateurActuel();
  if (!compte) return null;

  const maintenant = Math.floor(Date.now() / 1000);
  const [kpis, etudes, missions, queries, visitesSujet, visitesArc] = await Promise.all([
    kpisGlobaux(),
    listerEtudes(),
    toutesLesTaches(),
    aPermission(compte.role, "queries", "lire", compte.superAdmin)
      ? listerQueries()
      : Promise.resolve([]),
    aPermission(compte.role, "visites", "lire", compte.superAdmin)
      ? listerVisitesSujet()
      : Promise.resolve([]),
    aPermission(compte.role, "monitoring", "lire", compte.superAdmin)
      ? toutesLesVisites()
      : Promise.resolve([]),
  ]);

  const queriesOuvertes = queries.filter((q) => queryOuverte(q.query.statut));
  const tachesRetard = missions.filter(
    ({ tache }) =>
      tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant,
  );
  const visitesRetard = visitesSujet.filter(
    (v) =>
      v.visite.datePrevue &&
      v.visite.datePrevue < maintenant &&
      v.visite.statut !== "realisee" &&
      v.visite.statut !== "annulee",
  );
  const monitoringAvenir = visitesArc.filter((v) =>
    STATUTS_VISITE_OUVERTS.includes(v.visite.statut),
  );

  const role = compte.role;
  const estDm = role === "data_manager" || compte.superAdmin;
  const estArc = role === "arc" || compte.superAdmin;
  const estCp = role === "chef_projet" || role === "cp" || compte.superAdmin;

  return (
    <div className="space-y-8">
      <EntetePage
        surtitre={new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        titre={
          estDm
            ? "Data Management"
            : estArc
              ? "Monitoring"
              : "Tableau de bord"
        }
        description={
          estDm
            ? "Queries ouvertes, données manquantes et contrôles à faire."
            : estArc
              ? "Centres, visites à venir et actions en retard."
              : "Où en sont vos études, et ce qui demande une action."
        }
        actions={
          <>
            <FormulaireTache etudes={etudes} libelle="Nouvelle tâche" variante="discret" />
            <FormulaireEtude libelle="Nouvelle étude" variante="discret" />
          </>
        }
      />

      {etudes.length === 0 ? (
        <EtatVide
          titre="Votre espace est prêt."
          texte="Aucune étude n'est encore configurée. Créez-en une, ou chargez le jeu de démonstration depuis Administration pour explorer l'outil avec des données fictives."
          etapes={[
            "Créer une étude (protocole, phase, équipe)",
            "Ajouter les centres investigateurs",
            "Définir le calendrier des visites",
            "Inclure les premiers sujets",
          ]}
          action={{ href: "/etudes/nouvelle", libelle: "Créer mon premier projet" }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              libelle="Études actives"
              valeur={kpis.nEtudes}
              href="/etudes"
            />
            <Kpi
              libelle="Queries ouvertes"
              valeur={kpis.nQueries}
              alerte={kpis.nQueries > 0}
              href="/data-management/queries"
              detail={estDm ? "à traiter" : undefined}
            />
            <Kpi
              libelle="Tâches en retard"
              valeur={kpis.nTachesRetard}
              alerte={kpis.nTachesRetard > 0}
              href="/missions?masquerTerminees=1"
            />
            <Kpi
              libelle="Sujets inclus"
              valeur={kpis.nSujets}
              href="/sujets"
            />
            <Kpi
              libelle="Visites en retard"
              valeur={kpis.nVisitesRetard}
              alerte={kpis.nVisitesRetard > 0}
              href="/calendrier"
            />
            <Kpi
              libelle="Monitoring à venir"
              valeur={kpis.nMonitoring}
              href="/visites"
            />
            <Kpi
              libelle="Déviations ouvertes"
              valeur={kpis.nDeviations}
              href="/ecarts"
            />
            <Kpi libelle="Centres" valeur={etudes.reduce((n, e) => n + (e.nbCentresPrevu ?? 0), 0) || "—"} href="/centres" />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-titre text-lg font-bold">Études</h2>
              <Link href="/etudes" className="text-sm font-medium text-accent">
                Tout voir
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {etudes.slice(0, 6).map((e) => (
                <Link key={e.id} href={`/etudes/${e.id}`} className="carte-active p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.couleur }}
                      />
                      <span className="text-xs font-bold text-attenue">{e.code}</span>
                    </span>
                    <EtiquetteStatutEtude statut={e.statut} />
                  </div>
                  <p className="mt-2 truncate font-titre text-sm font-bold">{e.nom}</p>
                  {e.estDemo && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-attention">
                      Données de démonstration
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>

          {estDm && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-titre text-lg font-bold">Queries qui demandent une action</h2>
                <Link href="/data-management/queries" className="text-sm font-medium text-accent">
                  Module queries
                </Link>
              </div>
              {queriesOuvertes.length === 0 ? (
                <EtatVide
                  titre="Aucune query ouverte"
                  texte="Le nettoyage des données est à jour pour les études auxquelles vous avez accès."
                />
              ) : (
                <ul className="carte divide-y divide-ligne">
                  {queriesOuvertes.slice(0, 8).map((q) => (
                    <li key={q.query.id}>
                      <Link
                        href={`/data-management/queries/${q.query.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-creux"
                      >
                        <span>
                          <span className="font-semibold">{q.query.code}</span>
                          <span className="ml-2 text-sm text-attenue">{q.query.description}</span>
                        </span>
                        <span className="etiquette bg-attention-voile text-attention">
                          {q.query.statut}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {estArc && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-titre text-lg font-bold">Monitoring à venir</h2>
                <Link href="/visites" className="text-sm font-medium text-accent">
                  Toutes les visites
                </Link>
              </div>
              {monitoringAvenir.length === 0 ? (
                <EtatVide
                  titre="Aucun monitoring planifié"
                  texte="Planifiez une visite de mise en place, de routine ou de clôture."
                  action={{ href: "/visites", libelle: "Planifier une visite" }}
                />
              ) : (
                <ul className="carte divide-y divide-ligne">
                  {monitoringAvenir.slice(0, 6).map((v) => (
                    <li key={v.visite.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span>
                        {v.visite.centre ?? "Centre"} · {v.etudeCode}
                      </span>
                      <span className="text-attenue">{formaterDate(v.visite.datePrevue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {estCp && tachesRetard.length > 0 && (
            <section>
              <h2 className="mb-3 font-titre text-lg font-bold">Tâches en retard</h2>
              <ul className="carte divide-y divide-ligne">
                {tachesRetard.slice(0, 8).map(({ tache, etudeCode }) => (
                  <li key={tache.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>{tache.titre}</span>
                    <span className="text-alerte">{etudeCode}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visitesRetard.length > 0 && (
            <section>
              <h2 className="mb-3 font-titre text-lg font-bold">Visites sujets en retard</h2>
              <p className="mb-2 text-sm text-attenue">
                {visitesRetard.length} visite{visitesRetard.length > 1 ? "s" : ""} hors fenêtre.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
