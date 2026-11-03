import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { lireModules, navigationParRubrique } from "@/lib/modules";
import { chronoEnCours, indexRecherche, listerEtudes } from "@/lib/requetes";
import PaletteCommandes, { type EntreePalette } from "@/components/palette-commandes";
import { sigleEtude } from "@/lib/format";
import BarreLaterale from "@/components/barre-laterale";
import ChronoFlottant from "@/components/chrono-flottant";

// Rien de ce qui est derrière authentification n'a vocation à être indexé.
// robots.txt le dit déjà ; l'en-tête le redit pour un robot qui suivrait un
// lien direct sans relire robots.txt.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LayoutApplication({ children }: { children: React.ReactNode }) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [etudes, chrono, index] = await Promise.all([
    listerEtudes(),
    chronoEnCours(),
    indexRecherche(),
  ]);

  // La navigation se déduit des modules activés : elle ne montre que ce qui
  // sert à cette personne, et rien qui ne soit encore construit.
  const rubriques = navigationParRubrique(lireModules(compte.modules, compte.role)).map((r) => ({
    titre: r.titre,
    liens: r.modules.map((m) => ({ href: m.href as string, libelle: m.libelleNav ?? m.nom, icone: m.icone })),
  }));

  const sigles = new Map(etudes.map((e) => [e.id, sigleEtude(e)]));
  const entreesPalette: EntreePalette[] = [
    ...rubriques.flatMap((r) =>
      r.liens.map((l) => ({
        cle: `nav-${l.href}`,
        groupe: "Aller à",
        libelle: l.libelle,
        href: l.href,
        icone: l.icone,
      })),
    ),
    { cle: "nav-parametres", groupe: "Aller à", libelle: "Paramètres", href: "/parametres", icone: "reglages" },
    ...etudes.map((e) => ({
      cle: `etude-${e.id}`,
      groupe: "Études",
      libelle: sigleEtude(e),
      detail: e.code ? e.nom : null,
      href: `/etudes/${e.id}`,
      icone: "dossier" as const,
      couleur: e.couleur,
    })),
    ...index.missions.map((m) => ({
      cle: `mission-${m.id}`,
      groupe: "Missions",
      libelle: m.titre,
      detail: m.etudeId ? sigles.get(m.etudeId) : null,
      href: `/missions?q=${encodeURIComponent(m.titre)}`,
      icone: "cible" as const,
    })),
    ...index.notes.map((n) => ({
      cle: `note-${n.id}`,
      groupe: "Notes",
      libelle: `${n.icone} ${n.titre}`,
      href: `/pages/${n.id}`,
      icone: "page" as const,
    })),
  ];

  return (
    <div className="page-app flex min-h-screen">
      <PaletteCommandes entrees={entreesPalette} />
      <BarreLaterale
        etudes={etudes}
        nom={compte.nom}
        role={LIBELLES_ROLE[compte.role] ?? LIBELLES_ROLE.autre}
        rubriques={rubriques}
      />
      <div className="min-w-0 flex-1">
        {/* pt-20 sur mobile : laisse la place à la barre supérieure fixe. */}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-8 sm:pb-24 lg:pt-8">
          {/* Une pièce imprimée ou archivée doit dire d'où elle vient et de
              quand elle date : sans cela, un tirage retrouvé dans un classeur
              six mois plus tard n'est plus interprétable. */}
          <div className="impression-seule mb-4 border-b border-ligne pb-2 text-xs text-attenue">
            Vigie Clinique — {compte.nom} — édité le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          {children}
        </main>
      </div>
      <ChronoFlottant chrono={chrono} />
    </div>
  );
}
