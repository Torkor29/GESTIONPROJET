import { utilisateurActuel } from "@/lib/auth";
import { listerAudit } from "@/lib/clinique";
import { aPermission } from "@/lib/permissions";
import { EntetePage, Tableau } from "@/components/ui";
import BoutonsDemo from "@/components/boutons-demo";
import { formaterDateHeure } from "@/lib/format";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PageAdministration() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");
  if (!aPermission(compte.role, "admin", "lire", compte.superAdmin)) {
    redirect("/bord");
  }

  const journaux = await listerAudit();

  return (
    <div className="space-y-8">
      <EntetePage
        titre="Administration"
        description="Instance, données de démonstration, journal d'audit. L'audit trail n'est pas modifiable."
      />

      <section className="space-y-3">
        <h2 className="font-titre text-lg font-bold">Données de démonstration</h2>
        <p className="max-w-2xl text-sm text-attenue">
          Jeu fictif clairement identifié ([DÉMO], adresses @demo.vigie.local). Il
          permet de tester l&apos;outil sans données réelles. Réinitialiser remplace
          uniquement les objets de démonstration, pas vos études.
        </p>
        <BoutonsDemo />
      </section>

      <section className="space-y-3">
        <h2 className="font-titre text-lg font-bold">Journal d&apos;audit</h2>
        <p className="text-sm text-attenue">
          Qui a créé ou modifié quoi, avec l&apos;ancienne et la nouvelle valeur.
          Les utilisateurs standard ne peuvent pas modifier ces lignes.
        </p>
        {journaux.length === 0 ? (
          <p className="text-sm text-efface">Aucune entrée pour le moment.</p>
        ) : (
          <Tableau colonnes={["Quand", "Qui", "Action", "Objet"]}>
            {journaux.slice(0, 50).map((j) => (
              <tr key={j.journal.id}>
                <td className="chiffres whitespace-nowrap">{formaterDateHeure(j.journal.creeLe)}</td>
                <td>{j.auteurNom ?? "—"}</td>
                <td>{j.journal.action}</td>
                <td>
                  {j.journal.objetType} {j.journal.objetId ?? ""}
                </td>
              </tr>
            ))}
          </Tableau>
        )}
      </section>
    </div>
  );
}
