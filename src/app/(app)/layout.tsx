import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { lireModules, navigation } from "@/lib/modules";
import { chronoEnCours, listerEtudes } from "@/lib/requetes";
import BarreLaterale from "@/components/barre-laterale";
import ChronoFlottant from "@/components/chrono-flottant";

// Rien de ce qui est derrière authentification n'a vocation à être indexé.
// robots.txt le dit déjà ; l'en-tête le redit pour un robot qui suivrait un
// lien direct sans relire robots.txt.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LayoutApplication({ children }: { children: React.ReactNode }) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [etudes, chrono] = await Promise.all([listerEtudes(), chronoEnCours()]);

  // La navigation se déduit des modules activés : elle ne montre que ce qui
  // sert à cette personne, et rien qui ne soit encore construit.
  const liens = navigation(lireModules(compte.modules, compte.role)).map((m) => ({
    href: m.href as string,
    libelle: m.nom,
    icone: m.icone,
  }));

  return (
    <div className="flex min-h-screen">
      <BarreLaterale
        etudes={etudes}
        nom={compte.nom}
        role={LIBELLES_ROLE[compte.role] ?? LIBELLES_ROLE.autre}
        liens={liens}
      />
      <div className="min-w-0 flex-1">
        {/* pt-20 sur mobile : laisse la place à la barre supérieure fixe. */}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-8 sm:pb-24 lg:pt-6">
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
