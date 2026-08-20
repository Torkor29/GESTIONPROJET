import { listerJalons } from "@/lib/clinique";
import { toutesLesTaches, toutesLesVisites } from "@/lib/requetes";
import { listerVisitesSujet } from "@/lib/clinique";
import { EntetePage, EtatVide } from "@/components/ui";
import { formaterDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PageCalendrierGlobal() {
  const [jalons, taches, monitoring, visites] = await Promise.all([
    listerJalons(),
    toutesLesTaches(),
    toutesLesVisites(),
    listerVisitesSujet(),
  ]);

  type Evt = { date: number; type: string; titre: string; detail: string };
  const evts: Evt[] = [];
  for (const j of jalons) {
    if (j.jalon.datePrevue)
      evts.push({
        date: j.jalon.datePrevue,
        type: "Jalon",
        titre: j.jalon.nom,
        detail: j.etudeCode ?? "",
      });
  }
  for (const t of taches) {
    if (t.tache.echeance)
      evts.push({
        date: t.tache.echeance,
        type: "Tâche",
        titre: t.tache.titre,
        detail: t.etudeCode ?? "",
      });
  }
  for (const v of monitoring) {
    if (v.visite.datePrevue)
      evts.push({
        date: v.visite.datePrevue,
        type: "Monitoring",
        titre: v.visite.centre ?? "Visite ARC",
        detail: v.etudeCode ?? "",
      });
  }
  for (const v of visites) {
    if (v.visite.datePrevue)
      evts.push({
        date: v.visite.datePrevue,
        type: "Visite sujet",
        titre: `${v.subjectId} · ${v.visite.nom}`,
        detail: v.etudeCode ?? "",
      });
  }
  evts.sort((a, b) => a.date - b.date);

  return (
    <div className="space-y-5">
      <EntetePage
        titre="Calendrier"
        description="Monitoring, visites sujets, jalons et tâches — une seule timeline."
      />
      {evts.length === 0 ? (
        <EtatVide
          titre="Rien au calendrier pour l'instant."
          texte="Les échéances apparaissent dès qu'une visite, un jalon ou une tâche a une date."
        />
      ) : (
        <ul className="carte divide-y divide-ligne">
          {evts.slice(0, 80).map((e, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
              <span className="chiffres w-24 text-attenue">{formaterDate(e.date)}</span>
              <span className="w-28 text-xs font-semibold uppercase tracking-wide text-efface">
                {e.type}
              </span>
              <span className="min-w-0 flex-1 font-medium">{e.titre}</span>
              <span className="text-attenue">{e.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
