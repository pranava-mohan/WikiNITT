"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, Query } from "@/gql/graphql";
import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_ARTICLES } from "@/gql/queries";
import { useVirtualizer } from "@tanstack/react-virtual";
import FormattedDate from "@/components/FormattedDate";

interface ArticlesViewProps {
  articles: Article[];
}

const PAGE_SIZE = 9;

export default function ArticlesView({
  articles: initialArticles,
}: ArticlesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1024);

  const categories = [
    "All",
    ...new Set(initialArticles.map((article) => article.category)),
  ];

  const fetchArticles = async ({ pageParam = 0 }) => {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<Query>(endpoint, GET_ARTICLES, {
      category: selectedCategory === "All" ? null : selectedCategory,
      limit: PAGE_SIZE,
      offset: pageParam,
    });
    return data.articles;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["articles", selectedCategory],
      queryFn: fetchArticles,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PAGE_SIZE) return undefined;
        return allPages.length * PAGE_SIZE;
      },
      initialData:
        selectedCategory === "All"
          ? {
              pages: [initialArticles.slice(0, PAGE_SIZE)],
              pageParams: [0],
            }
          : undefined,
    });

  const allArticles = data ? data.pages.flatMap((page) => page) : [];

  const numColumns = useMemo(() => {
    if (containerWidth >= 1024) return 3;
    if (containerWidth >= 768) return 2;
    return 1;
  }, [containerWidth]);

  const rowCount =
    Math.ceil(allArticles.length / numColumns) + (hasNextPage ? 1 : 0);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 5,
  });

  useEffect(() => {
    if (!parentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(parentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (lastItem.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allArticles.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
    rowCount,
  ]);

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
          Latest <span className="text-indigo-600">Articles</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Stories, updates, and insights from the NIT Trichy community.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-indigo-600 text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        ref={parentRef}
        style={{
          height: "800px",
          width: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * numColumns;
            const rowArticles = allArticles.slice(
              startIndex,
              startIndex + numColumns,
            );

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex gap-8 px-4"
              >
                {rowArticles.map((article) => (
                  <article
                    key={article.id}
                    className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group w-full"
                    style={{
                      width: `calc((100% - ${
                        (numColumns - 1) * 32
                      }px) / ${numColumns})`,
                    }}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={article.thumbnail || "/images/placeholder.png"}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full shadow-sm">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <time dateTime={article.createdAt}>
                          <FormattedDate date={article.createdAt} />
                        </time>
                        <span className="mx-2">•</span>
                        <span>5 min read</span>
                      </div>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="block mt-2 group-hover:text-indigo-600 transition-colors duration-200"
                      >
                        <h3 className="text-xl font-bold text-gray-900">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="mt-auto pt-6 border-t border-gray-100 flex items-center">
                        <div className="shrink-0">
                          {article.author?.avatar ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={article.author.avatar}
                                alt={article.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                              {article.author?.name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {article.author?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">Author</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {isFetchingNextPage && virtualRow.index === rowCount - 1 && (
                  <div className="w-full flex justify-center items-center">
                    Loading more...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
