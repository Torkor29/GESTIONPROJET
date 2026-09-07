import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="font-titre text-4xl font-bold text-efface" aria-hidden>
          404
        </p>
        <h1 className="mt-3 font-titre text-xl font-semibold">Page introuvable</h1>
        <p className="mt-2 text-sm text-attenue">
          Cette page n&apos;existe pas, ou elle a été déplacée.
        </p>
        <Link href="/" className="bouton mt-5">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
