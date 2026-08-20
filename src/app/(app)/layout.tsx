import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { listerNotifications } from "@/lib/clinique";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { navigationPour } from "@/lib/navigation";
import { chronoEnCours, listerEtudes } from "@/lib/requetes";
import BarreLaterale from "@/components/barre-laterale";
import ChronoFlottant from "@/components/chrono-flottant";
import CommandePalette from "@/components/commande";
import Cloche from "@/components/cloche";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LayoutApplication({ children }: { children: React.ReactNode }) {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [etudes, chrono, notifs] = await Promise.all([
    listerEtudes(),
    chronoEnCours(),
    listerNotifications(compte.id),
  ]);

  const groupes = navigationPour(compte.role, compte.superAdmin);

  return (
    <div className="flex min-h-screen">
      <BarreLaterale
        etudes={etudes}
        nom={compte.nom}
        role={LIBELLES_ROLE[compte.role] ?? LIBELLES_ROLE.autre}
        groupes={groupes}
        notifications={notifs}
      />
      <div className="min-w-0 flex-1">
        <div className="sans-impression hidden items-center justify-end gap-2 border-b border-ligne/60 px-8 py-2.5 lg:flex">
          <CommandePalette />
          <Cloche items={notifs} />
        </div>
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-8 sm:pb-24 lg:pt-6">
          <div className="impression-seule mb-4 border-b border-ligne pb-2 text-xs text-attenue">
            Vigie — {compte.nom} — édité le{" "}
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
