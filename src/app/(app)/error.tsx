"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Erreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="carte mx-auto mt-10 max-w-md p-6 text-center">
      <p className="text-2xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-2 font-semibold">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-attenue">
        L&apos;action n&apos;a pas pu aboutir. Si vous étiez absent un long moment, votre session a
        peut-être expiré.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button type="button" onClick={reset} className="bouton">
          Réessayer
        </button>
        <Link href="/connexion" className="bouton-discret">
          Se reconnecter
        </Link>
      </div>
    </div>
  );
}
