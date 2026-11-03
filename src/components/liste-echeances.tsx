import Link from "next/link";
import { Icone, type NomIcone } from "./icones";
import { delaiRelatif, regrouperEcheances, type Echeance, type NatureEcheance } from "@/lib/echeances";

const ICONES: Record<NatureEcheance, NomIcone> = {
  mission: "cible",
  visite: "repere",
  convention: "euro",
  jalon: "drapeau",
};

const NATURES: Record<NatureEcheance, string> = {
  mission: "Mission",
  visite: "Visite",
  convention: "Convention",
  jalon: "Jalon",
};

/**
 * Échéances par horizon, en liste : une ligne par échéance, la date en
 * pavé à gauche. Plus compact qu'un calendrier, où les semaines vides
 * prenaient autant de place que les semaines chargées.
 */
export default function ListeEcheances({
  echeances,
  maintenant,
  vide = "Rien à l'horizon.",
  limiteJours,
  afficherEtude = false,
}: {
  echeances: Echeance[];
  maintenant: number;
  vide?: string;
  limiteJours?: number;
  afficherEtude?: boolean;
}) {
  const horizons = regrouperEcheances(echeances, maintenant, limiteJours);

  if (horizons.length === 0) {
    return <p className="py-6 text-center text-sm text-attenue">{vide}</p>;
  }

  return (
    <div className="space-y-4">
      {horizons.map((h) => (
        <section key={h.cle}>
          <h3
            className={`sur-titre mb-1.5 flex items-center gap-2 ${h.cle === "retard" ? "!text-alerte" : ""}`}
          >
            {h.titre}
            <span className="chiffres font-medium normal-case tracking-normal">{h.echeances.length}</span>
          </h3>
          <ul className="divide-y divide-ligne overflow-hidden rounded-lg border border-ligne">
            {h.echeances.map((e) => {
              const d = new Date(e.date * 1000);
              const retard = h.cle === "retard";
              return (
                <li key={e.cle} className="min-w-0">
                  <Link
                    href={e.href}
                    className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-creux/60"
                  >
                    <span
                      className={`flex w-10 shrink-0 flex-col items-center rounded-md py-0.5 leading-tight ${
                        retard ? "bg-alerte-voile text-alerte" : "bg-creux text-encre"
                      }`}
                    >
                      <span className="chiffres text-[15px] font-semibold">{d.getDate()}</span>
                      <span className="text-[10px] uppercase">
                        {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
                      </span>
                    </span>
                    <Icone
                      nom={ICONES[e.nature]}
                      className="h-4 w-4 shrink-0 text-efface"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{e.titre}</span>
                      <span className="block truncate text-xs text-attenue">
                        {NATURES[e.nature]}
                        {afficherEtude && e.etude ? ` · ${e.etude}` : ""}
                        {e.detail ? ` · ${e.detail}` : ""}
                      </span>
                    </span>
                    {afficherEtude && e.couleur && (
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-[3px]"
                        style={{ backgroundColor: e.couleur }}
                      />
                    )}
                    <span
                      className={`chiffres shrink-0 text-xs ${retard ? "font-medium text-alerte" : "text-efface"}`}
                    >
                      {delaiRelatif(e.date, maintenant)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
