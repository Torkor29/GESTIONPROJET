import Link from "next/link";
import { redirect } from "next/navigation";
import { appliquerMetier } from "@/actions/modules";
import ChoixModules from "@/components/choix-modules";
import FormulaireChangerMotDePasse from "./formulaire-mot-de-passe";
import { utilisateurActuel } from "@/lib/auth";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { lireModules } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function PageParametres() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const actifs = lireModules(compte.modules, compte.role);

  return (
    <div className="space-y-8">
      <header>
        <p className="sur-titre">Paramètres</p>
        <h1 className="mt-1.5 font-titre text-3xl font-bold">Vos modules</h1>
        <p className="mt-2 max-w-2xl text-attenue">
          Activez ce qui sert à votre travail, laissez le reste de côté. Rien
          n&apos;est définitif : vous pouvez revenir ici quand vous voulez, et
          un module désactivé ne perd aucune donnée.
        </p>
      </header>

      <section className="carte flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-titre text-lg font-bold">Équipe</h2>
          <p className="mt-1 text-sm text-attenue">
            Inviter des collègues sur cette installation, et voir qui a un compte.
          </p>
        </div>
        <Link href="/parametres/equipe" className="bouton-discret">
          Gérer l&apos;équipe
        </Link>
      </section>

      <section className="carte p-5">
        <h2 className="font-titre text-lg font-bold">Votre métier</h2>
        <p className="mt-1 text-sm text-attenue">
          Actuellement : <strong className="text-encre">{LIBELLES_ROLE[compte.role]}</strong>.
          En changer réapplique la sélection de modules suggérée pour ce métier
          — vos choix personnalisés seront remplacés.
        </p>
        <form action={appliquerMetier} className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="role" className="sr-only">
            Métier
          </label>
          <select id="role" name="role" defaultValue={compte.role} className="champ max-w-xs">
            {Object.entries(LIBELLES_ROLE).map(([cle, libelle]) => (
              <option key={cle} value={cle}>
                {libelle}
              </option>
            ))}
          </select>
          <button type="submit" className="bouton-discret">
            Appliquer les suggestions
          </button>
        </form>
      </section>

      <section className="carte p-5">
        <h2 className="font-titre text-lg font-bold">Mot de passe</h2>
        <p className="mt-1 text-sm text-attenue">
          Pour le changer ici, il faut encore connaître l&apos;actuel. Si vous
          l&apos;avez perdu, utilisez « Mot de passe oublié » sur l&apos;écran
          de connexion, avec la clé d&apos;installation.
        </p>
        <FormulaireChangerMotDePasse />
      </section>

      <ChoixModules actifs={actifs} />
    </div>
  );
}
