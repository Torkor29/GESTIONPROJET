import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="page-publique flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[12px] uppercase tracking-[-0.033em] text-efface">404</p>
        <h1 className="mt-4 font-titre text-[32px] tracking-[-0.02em]">Page introuvable</h1>
        <p className="mt-3 text-[14px] leading-[1.35] text-attenue">
          Cette page n&apos;existe pas, ou elle a été déplacée.
        </p>
        <Link href="/" className="bouton mt-8">
          Retour à l&apos;accueil
          <span aria-hidden>▸</span>
        </Link>
      </div>
    </main>
  );
}
