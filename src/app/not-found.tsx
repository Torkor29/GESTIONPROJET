import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-3xl" aria-hidden>
          🔍
        </p>
        <h1 className="mt-3 text-xl font-semibold">Page introuvable</h1>
        <p className="mt-2 text-sm text-attenue">
          Cette page n&apos;existe pas ou a été supprimée.
        </p>
        <Link href="/" className="bouton mt-5">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
