import Link from "next/link";
import { redirect } from "next/navigation";
import { appliquerMetier, enregistrerModules } from "@/actions/modules";
import { enregistrerRappelJours } from "@/actions/rappels";
import ChoixModules from "@/components/choix-modules";
import PersonnaliserAccueil from "@/components/personnaliser-accueil";
import FormulaireChangerMotDePasse from "./formulaire-mot-de-passe";
import { utilisateurActuel } from "@/lib/auth";
import { lireCompteSmtp } from "@/lib/courrier";
import { lireWidgetsAccueil } from "@/lib/accueil";
import { LIBELLES_ROLE } from "@/lib/constantes";
import { DOMAINES, MODULES, RUBRIQUES_NAVIGATION, construit, lireModules } from "@/lib/modules";
import { Icone } from "@/components/icones";

export const dynamic = "force-dynamic";

export default async function PageParametres() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const actifs = lireModules(compte.modules, compte.role);

  const sections = [
    { id: "modules", libelle: "Modules" },
    { id: "accueil", libelle: "Tableau de bord" },
    { id: "metier", libelle: "Métier" },
    { id: "rappels", libelle: "Rappels par mail" },
    { id: "securite", libelle: "Mot de passe" },
    { id: "equipe", libelle: "Équipe" },
  ];

  return (
    <div className="space-y-8">
      <header className="entete-page">
        <div>
          <h1>Paramètres</h1>
          <p className="entete-page-sous-titre">
            Ce qui s&apos;affiche pour vous, et comment Vigie vous prévient. Rien
            n&apos;est définitif : un module désactivé ne perd aucune donnée.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]">
        {/* Sommaire : sur grand écran, il reste à portée en défilant. */}
        <nav aria-label="Sections des paramètres" className="hidden lg:block">
          <ul className="sticky top-8 space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-md px-2.5 py-1.5 text-[13.5px] text-attenue transition-colors hover:bg-creux hover:text-encre"
                >
                  {s.libelle}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          <section id="modules" className="scroll-mt-8">
            <h2 className="text-base">Modules</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Activez ce qui sert à votre travail. Ils sont rangés comme dans la barre latérale.
            </p>
            <ChoixModules
              actifs={actifs}
              domaines={DOMAINES}
              rubriques={RUBRIQUES_NAVIGATION}
              enregistrer={enregistrerModules}
              modules={MODULES.map((m) => ({
                cle: m.cle,
                nom: m.nom,
                description: m.description,
                icone: m.icone,
                domaine: m.domaine,
                pret: construit(m),
                socle: Boolean(m.socle),
              }))}
            />
          </section>

          <section id="accueil" className="scroll-mt-8">
            <h2 className="text-base">Tableau de bord</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Les blocs de votre accueil : échéances, indicateurs, projets. Chaque compte compose
              le sien, sans toucher aux données.
            </p>
            <div className="bloc-app">
              <PersonnaliserAccueil actifs={lireWidgetsAccueil(compte.accueil)} />
            </div>
          </section>

          <section id="metier" className="scroll-mt-8">
            <h2 className="text-base">Métier</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Actuellement : <strong className="font-medium text-encre">{LIBELLES_ROLE[compte.role]}</strong>.
              En changer réapplique la sélection de modules suggérée pour ce métier — vos choix
              personnalisés seront remplacés.
            </p>
            <form action={appliquerMetier} className="bloc-app flex flex-wrap items-center gap-2">
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

          <section id="rappels" className="scroll-mt-8">
            <h2 className="text-base">Rappels par mail</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Un courrier vous rappelle les missions que vous portez (attribuées à vous, ou
              créées par vous et non attribuées), quelques jours avant leur échéance. Le rappel à
              une date précise se choisit sur chaque mission.
            </p>
            <div className="bloc-app">
              {!lireCompteSmtp() && (
                <p className="mb-3 rounded-lg bg-attention-voile px-3 py-2 text-sm text-attention">
                  Aucune messagerie n&apos;est configurée sur le serveur : aucun rappel ne part
                  pour l&apos;instant.
                </p>
              )}
              <form action={enregistrerRappelJours} className="flex flex-wrap items-center gap-2">
                <label htmlFor="rappelJours" className="text-sm">
                  Me prévenir
                </label>
                <select
                  id="rappelJours"
                  name="rappelJours"
                  defaultValue={String(compte.rappelJours)}
                  className="champ max-w-xs"
                >
                  <option value="0">Jamais</option>
                  {[1, 2, 3, 5, 7, 14].map((j) => (
                    <option key={j} value={j}>
                      {j} jour{j > 1 ? "s" : ""} avant l&apos;échéance
                    </option>
                  ))}
                </select>
                <button type="submit" className="bouton-discret">
                  Enregistrer
                </button>
              </form>
            </div>
          </section>

          <section id="securite" className="scroll-mt-8">
            <h2 className="text-base">Mot de passe</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Pour le changer ici, il faut encore connaître l&apos;actuel. Si vous l&apos;avez
              perdu, utilisez « Mot de passe oublié » sur l&apos;écran de connexion.
            </p>
            <div className="bloc-app">
              <FormulaireChangerMotDePasse />
            </div>
          </section>

          <section id="equipe" className="scroll-mt-8">
            <h2 className="text-base">Équipe</h2>
            <p className="mb-4 mt-1 text-sm text-attenue">
              Inviter des collègues sur cette installation, voir qui a un compte et gérer les
              droits.
            </p>
            <div className="bloc-app flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-creux text-attenue">
                  <Icone nom="personnes" className="h-4 w-4" />
                </span>
                Comptes, invitations et droits d&apos;accès
              </span>
              <Link href="/parametres/equipe" className="bouton-discret">
                Gérer l&apos;équipe
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
