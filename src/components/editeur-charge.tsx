"use client";

import dynamic from "next/dynamic";

/**
 * L'éditeur manipule le DOM dès son montage : il est chargé uniquement dans le
 * navigateur, jamais pendant le rendu serveur.
 */
const Editeur = dynamic(() => import("./editeur"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 pt-6" aria-label="Chargement de l'éditeur">
      <div className="h-4 w-2/3 animate-pulse rounded bg-creux" />
      <div className="h-4 w-full animate-pulse rounded bg-creux" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-creux" />
    </div>
  ),
});

export default function EditeurCharge(props: { pageId: number; contenuInitial: string }) {
  return <Editeur {...props} />;
}
