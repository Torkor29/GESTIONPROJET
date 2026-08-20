"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { lireNotification, toutLire } from "@/actions/administration";
import type { Notification } from "@/db/schema";
import { formaterDateHeure } from "@/lib/format";

export default function Cloche({ items }: { items: Notification[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [, start] = useTransition();
  const nonLues = items.filter((n) => !n.lu);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-ligne bg-relief text-attenue shadow-posee hover:text-encre"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {nonLues.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-alerte px-1 text-[10px] font-bold text-white">
            {nonLues.length}
          </span>
        )}
      </button>
      {ouvert && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ligne bg-relief shadow-elevee">
          <div className="flex items-center justify-between border-b border-ligne px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            {nonLues.length > 0 && (
              <button
                type="button"
                className="text-xs text-accent"
                onClick={() => start(() => toutLire())}
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-efface">Aucune notification.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className={n.lu ? "opacity-60" : ""}>
                <Link
                  href={n.lien ?? "#"}
                  className="block px-3 py-2.5 hover:bg-creux"
                  onClick={() => {
                    setOuvert(false);
                    if (!n.lu) start(() => lireNotification(n.id));
                  }}
                >
                  <p className="text-sm font-medium">{n.titre}</p>
                  {n.message && <p className="mt-0.5 text-xs text-attenue">{n.message}</p>}
                  <p className="mt-1 text-[11px] text-efface">{formaterDateHeure(n.creeLe)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
