import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePublicVue } from "@/components/article-public";
import {
  articleParSlug,
  articlesDe,
  cheminArticle,
  type CategorieArticle,
} from "@/lib/contenu-public";

export function paramsArticles(categorie: CategorieArticle) {
  return articlesDe(categorie).map((a) => ({ slug: a.slug }));
}

export async function metaArticle(
  categorie: CategorieArticle,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params;
  const article = articleParSlug(categorie, slug);
  if (!article) return { title: "Page introuvable — Vigie" };
  return {
    title: `${article.titre} — Vigie`,
    description: article.description,
    alternates: { canonical: cheminArticle(article) },
  };
}

export async function RenduArticle({
  categorie,
  params,
}: {
  categorie: CategorieArticle;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleParSlug(categorie, slug);
  if (!article) notFound();
  const voisins = articlesDe(categorie)
    .filter((a) => a.slug !== slug)
    .slice(0, 4);
  return <ArticlePublicVue article={article} voisins={voisins} />;
}
