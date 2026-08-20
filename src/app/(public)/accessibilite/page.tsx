import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibilité — Vigie",
  description:
    "Déclaration d'accessibilité de Vigie : pages publiques en HTML serveur, contrastes, navigation au clavier, langue française, limites connues de l'application authentifiée.",
  alternates: { canonical: "/accessibilite" },
};

export default function PageAccessibilite() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Établissement</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Accessibilité
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Cette page décrit l&apos;intention d&apos;accessibilité du site public et
          de l&apos;application. Elle n&apos;est pas une déclaration de conformité
          au RGAA ni un audit. Un établissement public qui met Vigie à disposition
          reste responsable, le cas échéant, de sa propre déclaration.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Site public
        </h2>
        <p>
          Les pages publiques sont rendues côté serveur en HTML. Le contenu
          principal est du texte, des titres hiérarchisés (un h1 par page, des h2
          de section), des listes, des liens nommés. La langue de la page est le
          français. L&apos;en-tête et le pied de page répètent la navigation. Un{" "}
          <Link href="/plan-du-site" className="text-accent hover:underline">
            plan du site
          </Link>{" "}
          liste les adresses.
        </p>
        <p>
          Les couleurs d&apos;interface visent un contraste lisible sur fond clair.
          Les liens ne reposent pas uniquement sur la couleur : ils sont
          soulignés au survol et portent un libellé. Les icônes décoratives sont
          masquées aux lecteurs d&apos;écran lorsque le texte adjacent suffit.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Application authentifiée
        </h2>
        <p>
          Une fois connecté, l&apos;interface est plus dense : tableaux, filtres,
          recherche (Ctrl+K), formulaires. La navigation au clavier est prévue
          sur les liens et les champs natifs. Certains composants (éditeur de
          pages de travail, menus) peuvent rester inférieurs à un niveau AA
          complet. C&apos;est une limite connue, à traiter comme une dette, pas
          comme un label d&apos;accessibilité.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Les formulaires utilisent des libellés visibles.</li>
          <li>Les messages d&apos;état vide sont du texte, pas seulement une illustration.</li>
          <li>Le cookie de session n&apos;est pas un obstacle à la lecture du site public.</li>
        </ul>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Signalement</h2>
        <p>
          Si un écran est inutilisable avec un clavier, un lecteur d&apos;écran ou
          un zoom, décrivez la page et le blocage via{" "}
          <Link href="/contact" className="text-accent hover:underline">
            Contact
          </Link>
          . Mentionnez le navigateur et, le cas échéant, le rôle du compte (ARC,
          data manager, etc.).
        </p>
      </div>
    </article>
  );
}
