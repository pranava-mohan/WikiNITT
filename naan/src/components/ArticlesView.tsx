"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, Query } from "@/gql/graphql";
import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_ARTICLES } from "@/gql/queries";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import FormattedDate from "@/components/FormattedDate";
import { Sparkles, Clock, User, ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

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
  const [listOffset, setListOffset] = useState(0);

  const categories = ["All", "Academics", "Campus Life", "Placements", "Sports"];

  const fetchArticles = async ({ pageParam = 0 }) => {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<Query>(endpoint, GET_ARTICLES, {
      category: null,
      limit: PAGE_SIZE,
      offset: pageParam,
    });
    return data.articles;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["articles"],
      queryFn: fetchArticles,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PAGE_SIZE) return undefined;
        return allPages.length * PAGE_SIZE;
      },
      initialData: {
        pages: [initialArticles.slice(0, PAGE_SIZE)],
        pageParams: [0],
      },
    });

  const allArticles = data ? data.pages.flatMap((page) => page) : [];

  const numColumns = useMemo(() => {
    if (containerWidth >= 768) return 2;
    return 1;
  }, [containerWidth]);

  const rowCount =
    Math.ceil(allArticles.length / numColumns) + (hasNextPage ? 1 : 0);

  useEffect(() => {
    if (parentRef.current) {
      setListOffset(parentRef.current.offsetTop);
    }
  }, []);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 480,
    overscan: 5,
    scrollMargin: listOffset,
  });

  useEffect(() => {
    if (!parentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setListOffset(parentRef.current?.offsetTop ?? 0);
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
    <div className="space-y-10 font-[Manrope,sans-serif]">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-in {
          animation: fadeSlideIn 0.4s ease-out;
        }
      `}</style>
      <div className="text-center space-y-4">
        <p className="text-[0.65rem] font-extrabold tracking-[2px] uppercase text-[#3b28cc]">
          Discover Knowledge
        </p>
        <h2 className="text-4xl md:text-5xl font-[Playfair_Display] font-semibold text-[#111] tracking-tight">
          Explore <span className="italic text-[#3b28cc]">Articles</span>
        </h2>
        <p className="max-w-2xl mx-auto text-base text-[#777] font-light leading-relaxed">
          Curated stories, academic resources, and campus guides written by the community.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={twMerge(
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95",
              selectedCategory === category
                ? "bg-[#3b28cc] text-white shadow-lg shadow-[#3b28cc]/20"
                : "bg-[#F3F1E6] text-[#555] hover:bg-[#e8e6da]"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        key={selectedCategory}
        ref={parentRef}
        className="animate-fade-slide-in"
        style={{
          width: "100%",
          position: "relative",
          height: `${rowVirtualizer.getTotalSize()}px`,
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
                transform: `translateY(${virtualRow.start - listOffset}px)`,
              }}
              className="flex gap-6 lg:gap-8 px-2 pb-6"
            >
              {rowArticles.map((article) => (
                <Link
                  href={`/articles/${article.slug}`}
                  key={article.id}
                  style={{
                    width: `calc((100% - ${(numColumns - 1) * 32}px) / ${numColumns})`,
                  }}
                  className="group flex flex-col h-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={article.thumbnail || "/nitt.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent opacity-60" />

                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/95 backdrop-blur-md text-[#3b28cc] rounded-lg shadow-sm">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs font-medium text-[#888] mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#3b28cc]" />
                        <FormattedDate date={article.createdAt} />
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>5 min read</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#111] leading-tight line-clamp-2 font-[Playfair_Display] mb-3 group-hover:text-[#3b28cc] transition-colors duration-200">
                      {article.title}
                    </h3>

                    <p className="text-sm text-[#777] line-clamp-2 leading-relaxed mb-6 font-light">
                      {article.description}
                    </p>

                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white shadow-sm ring-1 ring-slate-100">
                          <Image
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(article.author?.name || 'anonymous')}`}
                            alt={article.author?.name || "Author"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#222]">
                            {article.author?.name || "Unknown"}
                          </span>
                          <span className="text-[10px] text-[#999] font-medium">Author</span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#3b28cc] group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {isFetchingNextPage && virtualRow.index === rowCount - 1 && (
                <div className="absolute bottom-0 w-full flex justify-center items-center py-4">
                  <span className="text-sm text-[#3b28cc] font-medium animate-pulse">Loading more stories...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}