"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { fr } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote, usePrefersColorScheme } from "@blocknote/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { enregistrerPage } from "@/actions/pages";

type Etat = "repos" | "en_cours" | "enregistre" | "erreur";

const DELAI_SAUVEGARDE = 1200; // ms d'inactivité avant d'écrire en base

async function televerser(fichier: File): Promise<string> {
  const corps = new FormData();
  corps.append("file", fichier);

  const reponse = await fetch("/api/televersement", { method: "POST", body: corps });
  if (!reponse.ok) {
    const { erreur } = await reponse.json().catch(() => ({ erreur: null }));
    throw new Error(erreur ?? "Le téléversement a échoué.");
  }

  const { url } = await reponse.json();
  return url;
}

export default function Editeur({
  pageId,
  contenuInitial,
}: {
  pageId: number;
  contenuInitial: string;
}) {
  const theme = usePrefersColorScheme();
  const [etat, setEtat] = useState<Etat>("repos");
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dernierEnvoi = useRef(contenuInitial);

  const editeur = useCreateBlockNote({
    dictionary: fr,
    uploadFile: televerser,
    initialContent: (() => {
      try {
        const blocs = JSON.parse(contenuInitial);
        // Un document vide doit rester undefined, sinon BlockNote refuse de démarrer.
        return Array.isArray(blocs) && blocs.length > 0 ? blocs : undefined;
      } catch {
        return undefined;
      }
    })(),
  });

  const sauvegarder = useCallback(async () => {
    const contenu = JSON.stringify(editeur.document);
    if (contenu === dernierEnvoi.current) return;

    setEtat("en_cours");
    try {
      await enregistrerPage({ id: pageId, contenu });
      dernierEnvoi.current = contenu;
      setEtat("enregistre");
    } catch {
      setEtat("erreur");
    }
  }, [editeur, pageId]);

  const planifier = useCallback(() => {
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(sauvegarder, DELAI_SAUVEGARDE);
  }, [sauvegarder]);

  // Sauvegarde immédiate quand on quitte l'onglet ou qu'on ferme la page :
  // ce qui a été tapé dans la dernière seconde n'est pas perdu.
  useEffect(() => {
    const surSortie = () => {
      if (minuterie.current) {
        clearTimeout(minuterie.current);
        void sauvegarder();
      }
    };
    document.addEventListener("visibilitychange", surSortie);
    window.addEventListener("pagehide", surSortie);
    return () => {
      document.removeEventListener("visibilitychange", surSortie);
      window.removeEventListener("pagehide", surSortie);
      surSortie();
    };
  }, [sauvegarder]);

  return (
    <div>
      <div className="mb-2 h-4 text-right text-xs text-muted" aria-live="polite">
        {etat === "en_cours" && "Enregistrement…"}
        {etat === "enregistre" && "Enregistré"}
        {etat === "erreur" && (
          <span className="text-red-500">
            Échec de l&apos;enregistrement — vérifiez votre connexion.
          </span>
        )}
      </div>

      <BlockNoteView
        editor={editeur}
        theme={theme === "dark" ? "dark" : "light"}
        onChange={planifier}
      />
    </div>
  );
}
