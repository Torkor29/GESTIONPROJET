"use client";

import { useEffect, useRef, useState } from "react";
import { noterChecklist } from "@/actions/checklists";

/** Note libre attachée à une ligne de checklist, enregistrée après une pause. */
export default function NoteChecklist({
  id,
  noteInitiale,
}: {
  id: number;
  noteInitiale: string;
}) {
  const [note, setNote] = useState(noteInitiale);
  const [ouvert, setOuvert] = useState(Boolean(noteInitiale));
  const [etat, setEtat] = useState<"repos" | "enregistre">("repos");
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note === noteInitiale) return;
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(async () => {
      await noterChecklist({ id, notes: note });
      setEtat("enregistre");
      setTimeout(() => setEtat("repos"), 1500);
    }, 900);
    return () => {
      if (minuterie.current) clearTimeout(minuterie.current);
    };
  }, [note, noteInitiale, id]);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-xs text-muted underline-offset-2 transition hover:text-accent hover:underline"
      >
        + Ajouter une note
      </button>
    );
  }

  return (
    <div className="mt-1.5">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Date, référence, personne contactée, point de vigilance…"
        aria-label="Note sur cette ligne"
        className="champ resize-y text-xs"
      />
      <p className="mt-0.5 h-3 text-right text-[10px] text-muted">
        {etat === "enregistre" && "Note enregistrée"}
      </p>
    </div>
  );
}
