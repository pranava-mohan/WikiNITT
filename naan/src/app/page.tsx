import Hero from "@/components/Hero";
export const dynamic = "force-dynamic";

import FeaturesSection from "@/components/FeaturesSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";

import { request } from "graphql-request";
import { GET_ARTICLES } from "@/gql/queries";
import { Article, Query } from "@/gql/graphql";

async function getFeaturedArticles() {
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
  try {
    const data = await request<Query>(endpoint, GET_ARTICLES, {
      featured: true,
    });
    return data?.articles || [];
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

export default async function Home() {
  const featuredArticles = await getFeaturedArticles();

  return (
    <div className="flex flex-col min-h-screen">
      {}
      <Hero />
      <FeaturesSection />
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-12">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Featured Articles
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Latest from the Community
            </p>
          </div>
          <FeaturedCarousel articles={featuredArticles} />
        </div>
      </section>
    </div>
  );
}
