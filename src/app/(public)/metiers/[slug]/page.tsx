import type { Metadata } from "next";
import { metaArticle, paramsArticles, RenduArticle } from "@/lib/rendu-article";

export function generateStaticParams() {
  return paramsArticles("metiers");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return metaArticle("metiers", params);
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <RenduArticle categorie="metiers" params={params} />;
}
