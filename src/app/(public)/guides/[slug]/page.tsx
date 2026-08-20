import type { Metadata } from "next";
import { metaArticle, paramsArticles, RenduArticle } from "@/lib/rendu-article";

export function generateStaticParams() {
  return paramsArticles("guides");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return metaArticle("guides", params);
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <RenduArticle categorie="guides" params={params} />;
}
