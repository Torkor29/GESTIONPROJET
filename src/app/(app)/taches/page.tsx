import Link from "next/link";
import FormulaireTache from "@/components/formulaire-tache";
import ListeTaches from "@/components/liste-taches";
import { listerEtudes, toutesLesTaches } from "@/lib/requetes";

export const dynamic = "force-dynamic";

const FILTRES = [
  { cle: "ouvertes", libelle: "À faire" },
  { cle: "en_retard", libelle: "En retard" },
  { cle: "terminees", libelle: "Terminées" },
  { cle: "toutes", libelle: "Toutes" },
] as const;

export default async function PageTaches({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre = "ouvertes" } = await searchParams;
  const maintenant = Math.floor(Date.now() / 1000);

  const [lignes, etudes] = await Promise.all([toutesLesTaches(), listerEtudes()]);

  const filtrees = lignes.filter(({ tache }) => {
    switch (filtre) {
      case "terminees":
        return tache.statut === "terminee";
      case "en_retard":
        return tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant;
      case "toutes":
        return true;
      default:
        return tache.statut !== "terminee";
    }
  });

  const compte = (cle: string) =>
    lignes.filter(({ tache }) => {
      switch (cle) {
        case "terminees":
          return tache.statut === "terminee";
        case "en_retard":
          return tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant;
        case "toutes":
          return true;
        default:
          return tache.statut !== "terminee";
      }
    }).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Tâches</h1>
        <FormulaireTache etudes={etudes} libelle="Nouvelle tâche" />
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f.cle}
            href={`/taches?filtre=${f.cle}`}
            aria-current={filtre === f.cle ? "page" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm transition
                        ${
                          filtre === f.cle
                            ? "border-accent bg-accent/10 font-medium text-accent"
                            : "border-line text-muted hover:text-ink"
                        }`}
          >
            {f.libelle}
            <span className="chiffres ml-1.5 text-xs opacity-70">{compte(f.cle)}</span>
          </Link>
        ))}
      </nav>

      <ListeTaches
        lignes={filtrees}
        etudes={etudes}
        message={
          filtre === "en_retard"
            ? "Aucune tâche en retard. Tout est à jour."
            : "Aucune tâche dans ce filtre."
        }
      />
    </div>
  );
}
