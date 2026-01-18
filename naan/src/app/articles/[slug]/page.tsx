"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_ARTICLE_BY_SLUG } from "@/gql/queries";
import { Query } from "@/gql/graphql";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import remarkBreaks from "remark-breaks";
import FormattedDate from "@/components/FormattedDate";

const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false },
);

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const endpoint =
        process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
        "http://localhost:8080/query";
      const data = await request<Query>(endpoint, GET_ARTICLE_BY_SLUG, {
        slug,
      });
      return data.articleBySlug;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-indigo-100 text-indigo-600 rounded-full">
          {data.category}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {data.title}
        </h1>
        <div className="flex items-center space-x-4">
          {data.author?.avatar ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={data.author.avatar}
                alt={data.author.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
              {data.author?.name?.charAt(0) || "?"}
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {data.author?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-500">
              <FormattedDate date={data.createdAt} />
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg mb-12">
        <Image
          src={data.thumbnail || "/images/placeholder.png"}
          alt={data.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div data-color-mode="light" style={{ width: "100%" }}>
        <Markdown source={data.content} remarkPlugins={[remarkBreaks]} />
      </div>
    </article>
  );
}
