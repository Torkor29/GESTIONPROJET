import type { Metadata } from "next";
import Link from "next/link";
import { Icone, type NomIcone } from "@/components/icones";
import { NOM_PRODUIT } from "@/lib/site";

export const metadata: Metadata = {
  title: `Confidentialité et hébergement — ${NOM_PRODUIT}`,
  description:
    "Ce que Vigie Clinique enregistre dans l'espace de travail, et ce qu'il n'a pas vocation à recevoir. Hébergement sur votre serveur, cloisonnement des comptes, partage explicite, chiffrement, sauvegardes et durée de conservation.",
  alternates: { canonical: "/donnees" },
};

const enregistre: { icone: NomIcone; titre: string; texte: string }[] = [
  {
    icone: "dossier",
    titre: "Le dossier administratif de l'étude",
    texte:
      "Acronyme, promoteur, investigateur coordonnateur, identifiants réglementaires (ID-RCB, numéro CTIS, référence CPP), centres, statut et calendrier. Rien qui ne figure déjà sur la page de garde d'un protocole.",
  },
  {
    icone: "drapeau",
    titre: "Le travail à faire et son avancement",
    texte:
      "Missions, échéances, responsables, commentaires, checklists réglementaires cochées ou annotées, visites de monitorage planifiées et réalisées, écarts constatés et actions correctives associées.",
  },
  {
    icone: "chrono",
    titre: "Le temps passé",
    texte:
      "Des durées rattachées à une étude et à une activité, saisies au chronomètre ou à la main. Utile pour la refacturation au promoteur et pour objectiver la charge d'une équipe.",
  },
  {
    icone: "document",
    titre: "Des documents de projet",
    texte:
      "Les pièces d'un Trial Master File : protocole, notes d'information, autorisations, conventions, comptes rendus. Des documents de conduite d'étude, versionnés et datés.",
  },
  {
    icone: "personnes",
    titre: "Les comptes des utilisateurs",
    texte:
      "Nom, adresse électronique professionnelle, métier déclaré, mot de passe haché avec scrypt et un sel propre à chaque compte, date de dernière connexion.",
  },
];

export default function PageDonnees() {
  return (
    <div className="px-5 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="sur-titre">Confidentialité et hébergement</p>
        <h1 className="mt-4 font-titre text-[32px] leading-[1.2] tracking-[-0.02em] sm:text-[48px]">
          Un espace de travail, pas un dossier patient
        </h1>
        <p className="mt-6 text-[18px] leading-[1.35] text-attenue sm:text-[20px]">
          Vigie Clinique suit le travail que représente une étude clinique :
          les démarches, les échéances, les documents, le temps passé. Les
          informations des personnes qui participent à la recherche vivent
          ailleurs — dans l&apos;eCRF du promoteur et dans le dossier patient.
          Cette séparation n&apos;est pas un détail d&apos;architecture, c&apos;est
          le principe de conception de l&apos;outil.
        </p>

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">
            Ce qui figure dans l&apos;espace de travail
          </h2>
          <div className="mt-6 space-y-3">
            {enregistre.map((e) => (
              <article key={e.titre} className="carte flex items-start gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-voile text-accent-appuye">
                  <Icone nom={e.icone} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-titre font-bold">{e.titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-attenue">{e.texte}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">
            Ce que l&apos;outil n&apos;a pas vocation à recevoir
          </h2>
          <p className="mt-3 leading-relaxed text-attenue">
            Aucun champ de l&apos;application n&apos;est prévu pour recueillir des
            informations de santé : ni identité de participant, ni date de
            naissance, ni antécédent, ni résultat d&apos;examen, ni donnée de
            tolérance. L&apos;outil n&apos;est ni un eCRF, ni un registre de
            patients, ni un support de pharmacovigilance, et il ne remplace
            aucun de ces systèmes.
          </p>

          <div className="carte mt-6 border-attention/30 bg-attention-voile/40 p-5">
            <h3 className="flex items-center gap-2.5 font-titre font-bold">
              <span className="text-attention">
                <Icone nom="bouclier" className="h-5 w-5" />
              </span>
              Le cas du numéro d&apos;inclusion
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed">
              L&apos;outil n&apos;est pas conçu pour un suivi nominatif des
              participants. Un simple compteur — nombre de personnes
              présélectionnées, incluses, sorties d&apos;étude — ne désigne
              personne. En revanche, un numéro d&apos;inclusion associé à des
              dates est une donnée pseudonymisée, pas une donnée anonyme,
              puisque la table de correspondance existe dans le centre.
            </p>
            <p className="mt-2.5 text-sm leading-relaxed">
              Si un tel suivi devait un jour entrer dans l&apos;espace de
              travail, il relèverait du cadre applicable à la recherche —
              méthodologie de référence de la CNIL retenue, registre des
              traitements, information des personnes — et cette décision
              reviendrait au responsable de traitement de l&apos;étude, pas à
              l&apos;application.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">Cloisonnement</h2>
          <p className="mt-3 leading-relaxed text-attenue">
            Chaque personne a son compte, sa session et ses modules. Une étude
            n&apos;est visible que de la personne qui l&apos;a créée et de celles
            qu&apos;elle y a conviées, en lecture ou en écriture — et tout ce qui
            dépend d&apos;une étude, missions, documents, visites, écarts,
            conventions, suit cet accès.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Le partage est explicite : rien n'est visible par défaut à l'échelle de l'établissement.",
              "Les invitations se remettent de la main à la main : aucune adresse n'est confiée à un service tiers, et aucun serveur de courrier n'est nécessaire. Un lien vaut sept jours et ne sert qu'une fois.",
              "Un compte désactivé perd l'accès immédiatement, sans attendre l'expiration de son cookie de session.",
              "Le téléchargement d'un document vérifie l'accès à l'étude dont il dépend, et pas seulement le fait d'être connecté.",
              "Les indicateurs d'équipe ne portent que sur les études dont on est propriétaire, et se limitent à des totaux.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-1 shrink-0 text-accent">
                  <Icone nom="checklist" className="h-4 w-4" />
                </span>
                <span className="text-attenue">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">Hébergement et sauvegardes</h2>
          <p className="mt-3 leading-relaxed text-attenue">
            Vigie Clinique s&apos;installe sur le serveur de son utilisateur : il
            n&apos;y a pas de service central, pas de compte chez un éditeur, pas
            de transfert vers un tiers. Les échanges avec le navigateur passent
            par HTTPS, le certificat étant obtenu et renouvelé automatiquement.
            La base et les fichiers déposés tiennent dans un seul répertoire,
            qui se sauvegarde par un script fourni ; la copie est prise de
            façon cohérente même pendant que l&apos;application tourne.
          </p>
          <p className="mt-3 leading-relaxed text-attenue">
            La durée de conservation est celle que fixe l&apos;établissement
            responsable de l&apos;étude. L&apos;outil ne supprime rien tout seul
            et ne conserve rien après suppression : effacer une étude efface ce
            qui en dépend.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">Briques logicielles</h2>
          <p className="mt-3 leading-relaxed text-attenue">
            Toutes les dépendances sont sous licence libre irrévocable — MIT, MPL
            2.0 ou Apache 2.0. Une version publiée sous ces licences le reste
            définitivement : l&apos;outil ne peut pas devenir payant, et les
            versions sont figées tant qu&apos;une mise à jour n&apos;est pas
            déclenchée volontairement.
          </p>
        </section>

        <p className="mt-14 text-sm text-attenue">
          Pour le détail des cadres réglementaires pris en charge, voir{" "}
          <Link href="/reglementaire" className="text-accent hover:underline">
            les référentiels
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
