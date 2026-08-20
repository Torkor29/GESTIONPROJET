import Link from "next/link";
import {
  CHEMINS_CATEGORIE,
  LIBELLES_CATEGORIE,
  cheminArticle,
  type ArticlePublic,
  type BlocArticle,
  type CategorieArticle,
} from "@/lib/contenu-public";

function Bloc({ bloc }: { bloc: BlocArticle }) {
  if (bloc.type === "p") {
    return <p>{bloc.texte}</p>;
  }
  if (bloc.type === "h2") {
    return <h2 className="pt-4 font-titre text-2xl font-bold text-encre">{bloc.texte}</h2>;
  }
  if (bloc.type === "ul") {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {bloc.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="carte border-attention/25 bg-attention-voile/40 p-5">
      {bloc.titre && <p className="font-titre font-bold text-encre">{bloc.titre}</p>}
      <p className={bloc.titre ? "mt-2" : ""}>{bloc.texte}</p>
    </div>
  );
}

export function ArticlePublicVue({
  article,
  voisins,
}: {
  article: ArticlePublic;
  voisins: ArticlePublic[];
}) {
  const hub = CHEMINS_CATEGORIE[article.categorie];
  const date = article.date
    ? new Date(article.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">
        <Link href={hub} className="hover:text-accent">
          {LIBELLES_CATEGORIE[article.categorie]}
        </Link>
      </p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">{article.titre}</h1>
      {date && <p className="mt-3 text-sm text-efface">{date}</p>}
      <p className="mt-5 text-lg leading-relaxed text-attenue">{article.resume}</p>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        {article.corps.map((bloc, i) => (
          <Bloc key={i} bloc={bloc} />
        ))}
      </div>

      {voisins.length > 0 && (
        <aside className="mt-16 border-t border-ligne pt-10">
          <p className="sur-titre">Dans la même rubrique</p>
          <ul className="mt-4 space-y-3">
            {voisins.map((v) => (
              <li key={v.slug}>
                <Link href={cheminArticle(v)} className="font-medium text-accent hover:underline">
                  {v.titre}
                </Link>
                <p className="mt-1 text-sm text-attenue">{v.resume}</p>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}

export function HubPublic({
  categorie,
  titre,
  intro,
  articles,
}: {
  categorie: CategorieArticle;
  titre: string;
  intro: string;
  articles: ArticlePublic[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">{LIBELLES_CATEGORIE[categorie]}</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">{titre}</h1>
      <p className="mt-5 text-lg leading-relaxed text-attenue">{intro}</p>
      <div className="mt-12 space-y-4">
        {articles.map((a) => (
          <Link key={a.slug} href={cheminArticle(a)} className="carte carte-active block p-6">
            <h2 className="font-titre text-xl font-bold">{a.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-attenue">{a.resume}</p>
            <span className="mt-3 inline-block text-sm font-medium text-accent">Lire la page</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
