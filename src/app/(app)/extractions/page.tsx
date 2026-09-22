import Link from "next/link";
import MenuExport from "@/components/menu-export";
import { Icone, type NomIcone } from "@/components/icones";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import {
  parametresExportExtraction,
  type LigneSuivi,
  type ParamsExtraction,
} from "@/lib/extraction-missions";
import { suiviMissions } from "@/lib/extraction-serveur";
import { listerEtudes } from "@/lib/requetes";

export const dynamic = "force-dynamic";

function Chiffre({
  libelle,
  valeur,
  icone,
  alerte,
}: {
  libelle: string;
  valeur: number;
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
      <p className={`chiffres mt-2 font-titre text-3xl font-bold ${alerte ? "text-alerte" : ""}`}>
        {valeur}
      </p>
    </div>
  );
}

export default async function PageExtractions({
  searchParams,
}: {
  searchParams: Promise<ParamsExtraction>;
}) {
  const params = await searchParams;
  const [etudes, suivi] = await Promise.all([listerEtudes(), suiviMissions(params)]);
  const { lignes, synthese, groupes, assignees } = suivi;

  const filtresActifs = Boolean(
    params.etude || params.statut || params.assigne || params.du || params.au || params.archives,
  );

  return (
    <div className="space-y-5">
      <style>{`@media print { @page { size: A4 landscape; margin: 12mm; } }`}</style>

      <header className="anime-bloc flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sur-titre">Extractions</p>
          <h1 className="mt-1.5 font-titre text-3xl font-bold">Suivi des missions</h1>
          <p className="mt-2 max-w-2xl text-sm text-attenue">
            Tout ce qu&apos;il faut pour un point de suivi : intitulé, statut, étude, attribution,
            échéance, retard, étapes, commentaires et temps. Excel, CSV, ou PDF via
            l&apos;impression.
          </p>
        </div>
        <MenuExport
          base="/api/export-suivi"
          parametres={parametresExportExtraction(params)}
        />
      </header>

      <form method="get" className="sans-impression bloc-app anime-bloc flex flex-wrap items-end gap-3">
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

        <div className="min-w-40">
          <label htmlFor="statut" className="mb-1.5 block text-xs text-attenue">
            Statut
          </label>
          <select id="statut" name="statut" defaultValue={params.statut ?? ""} className="champ">
            <option value="">Tous</option>
            {Object.entries(LIBELLES_STATUT_MISSION).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-44">
          <label htmlFor="assigne" className="mb-1.5 block text-xs text-attenue">
            Attribuée à
          </label>
          <select id="assigne" name="assigne" defaultValue={params.assigne ?? ""} className="champ">
            <option value="">Tout le monde</option>
            <option value="non">Non attribuée</option>
            {assignees.map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-36">
          <label htmlFor="du" className="mb-1.5 block text-xs text-attenue">
            Échéance du
          </label>
          <input id="du" name="du" type="date" defaultValue={params.du ?? ""} className="champ" />
        </div>

        <div className="min-w-36">
          <label htmlFor="au" className="mb-1.5 block text-xs text-attenue">
            au
          </label>
          <input id="au" name="au" type="date" defaultValue={params.au ?? ""} className="champ" />
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="archives"
            value="1"
            defaultChecked={params.archives === "1"}
            className="h-4 w-4 accent-indigo-600"
          />
          Inclure les archives
        </label>

        <button type="submit" className="bouton-discret">
          Filtrer
        </button>
        {filtresActifs && (
          <Link href="/extractions" className="pb-2 text-sm text-attenue hover:text-encre">
            Réinitialiser
          </Link>
        )}
      </form>

      <p className="impression-seule text-sm text-attenue">
        {synthese.total} mission{synthese.total > 1 ? "s" : ""}
        {synthese.enRetard > 0 ? ` · ${synthese.enRetard} en retard` : ""}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Chiffre libelle="Missions" valeur={synthese.total} icone="drapeau" />
        <Chiffre libelle="Non démarrées" valeur={synthese.aFaire} icone="checklist" />
        <Chiffre libelle="En cours" valeur={synthese.enCours} icone="chrono" />
        <Chiffre libelle="Terminées" valeur={synthese.terminees} icone="page" />
        <Chiffre
          libelle="En retard"
          valeur={synthese.enRetard}
          icone="eclair"
          alerte={synthese.enRetard > 0}
        />
      </div>

      {lignes.length === 0 ? (
        <p className="carte p-10 text-center text-sm text-attenue">
          Aucune mission ne correspond à ces filtres.
        </p>
      ) : (
        <div className="space-y-5">
          {groupes.map((g) => (
            <TableauGroupe key={g.etude} etude={g.etude} lignes={g.lignes} />
          ))}
        </div>
      )}
    </div>
  );
}

function TableauGroupe({
  etude,
  lignes,
}: {
  etude: string;
  lignes: LigneSuivi[];
}) {
  const retards = lignes.filter((l) => l.enRetard).length;
  return (
    <section className="carte relative overflow-x-auto">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ligne px-5 py-3">
        <h2 className="font-titre text-lg font-bold">{etude}</h2>
        <p className="chiffres text-sm text-attenue">
          {lignes.length} mission{lignes.length > 1 ? "s" : ""}
          {retards > 0 && <span className="text-alerte"> · {retards} en retard</span>}
        </p>
      </div>
      <table className="w-full min-w-[64rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ligne bg-creux/50 text-left">
            <th scope="col" className="sur-titre px-5 py-3">
              Mission
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Attribuée à
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Statut
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Importance
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Échéance
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Délai
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Étapes
            </th>
            <th scope="col" className="sur-titre px-3 py-3">
              Commentaire
            </th>
            <th scope="col" className="sans-impression sur-titre px-3 py-3">
              Temps
            </th>
            <th scope="col" className="sans-impression sur-titre px-3 py-3">
              Terminée le
            </th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr
              key={l.id}
              className="border-b border-ligne align-top last:border-0 hover:bg-creux/60"
            >
              <td className="px-5 py-3">
                <div className="font-medium">{l.titre}</div>
                {l.etapesDetail && (
                  <p className="mt-1 whitespace-pre-line text-xs text-attenue">{l.etapesDetail}</p>
                )}
                {l.archivee && (
                  <p className="mt-1 text-xs text-attenue">Archivée</p>
                )}
              </td>
              <td className="px-3 py-3">{l.assignee || <span className="text-efface">—</span>}</td>
              <td className="px-3 py-3">{l.statut}</td>
              <td className="px-3 py-3">{l.priorite}</td>
              <td className="chiffres px-3 py-3">{l.echeance || <span className="text-efface">—</span>}</td>
              <td className={`chiffres px-3 py-3 ${l.enRetard ? "font-semibold text-alerte" : ""}`}>
                {l.delai || <span className="text-efface">—</span>}
              </td>
              <td className="chiffres px-3 py-3">
                {l.etapesResume || <span className="text-efface">—</span>}
              </td>
              <td className="max-w-xs px-3 py-3 text-attenue">{l.commentaire}</td>
              <td className="sans-impression chiffres px-3 py-3">
                {l.temps || <span className="text-efface">—</span>}
              </td>
              <td className="sans-impression chiffres px-3 py-3">
                {l.termineeLe || <span className="text-efface">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
