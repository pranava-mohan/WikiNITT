import FeaturedCarousel from "@/components/FeaturedCarousel";
export const dynamic = "force-dynamic";

import ArticlesView from "@/components/ArticlesView";
import { request } from "graphql-request";
import { GET_ARTICLES } from "@/gql/queries";
import { Article, Query } from "@/gql/graphql";

async function getArticles() {
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
  try {
    const data = await request<Query>(endpoint, GET_ARTICLES, {
      limit: 9,
      offset: 0,
    });
    return data?.articles || [];
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

async function getFeaturedArticles() {
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
  try {
    const data = await request<Query>(endpoint, GET_ARTICLES, {
      featured: true,
    });
    return data?.articles || [];
  } catch (error) {
    console.error("Failed to fetch featured articles:", error);
    return [];
  }
}

export default async function ArticlesPage() {
  const [articles, featuredArticles] = await Promise.all([
    getArticles(),
    getFeaturedArticles(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {}
        <FeaturedCarousel articles={featuredArticles} />
        <ArticlesView articles={articles} />
      </div>
    </div>
  );
}
