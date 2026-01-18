"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, FileText, Users, MessageSquare, Hash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { SEARCH_ARTICLES, SEARCH_COMMUNITY } from "@/queries/search";
import Link from "next/link";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["searchArticles", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const data = await request<any>(
        process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
        SEARCH_ARTICLES,
        { query: debouncedQuery, limit: 5 },
      );
      return data.searchArticles;
    },
    enabled: !!debouncedQuery,
  });

  const { data: community, isLoading: loadingCommunity } = useQuery({
    queryKey: ["searchCommunity", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const data = await request<any>(
        process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
        SEARCH_COMMUNITY,
        { query: debouncedQuery, limit: 5 },
      );
      return data.searchCommunity;
    },
    enabled: !!debouncedQuery,
  });

  const handleLinkClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            className="flex-1 outline-none text-lg placeholder:text-gray-400"
            placeholder="Search WikiNITT..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="bg-gray-50 min-h-[300px]">
          <Tabs defaultValue="articles" className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full justify-start bg-gray-200/50 p-1">
                <TabsTrigger value="articles" className="flex-1">
                  Articles
                </TabsTrigger>
                <TabsTrigger value="community" className="flex-1">
                  Community
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="articles" className="mt-0">
                {loadingArticles ? (
                  <div className="text-center text-gray-500 py-8">
                    Searching...
                  </div>
                ) : articles?.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article: any) => (
                      <div
                        key={article.id}
                        onClick={() =>
                          handleLinkClick(`/articles/${article.slug}`)
                        }
                        className="flex gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-gray-100"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
                          {article.thumbnail ? (
                            <Image
                              src={article.thumbnail}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {article.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : debouncedQuery ? (
                  <div className="text-center text-gray-500 py-8">
                    No articles found
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Start typing to search articles...
                  </div>
                )}
              </TabsContent>

              <TabsContent value="community" className="mt-0">
                {loadingCommunity ? (
                  <div className="text-center text-gray-500 py-8">
                    Searching...
                  </div>
                ) : community?.length > 0 ? (
                  <div className="space-y-3">
                    {community.map((item: any) => {
                      if (item.content && item.title) {
                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              handleLinkClick(
                                `/c/${item.group.slug}/${item.id}`,
                              )
                            }
                            className="flex gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <div className="mt-1">
                              <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                <span className="font-semibold text-gray-700">
                                  c/{item.group.slug}
                                </span>
                                <span>•</span>
                                <span>Posted by u/{item.author.username}</span>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (item.membersCount !== undefined) {
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleLinkClick(`/c/${item.slug}`)}
                            className="flex gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <div className="mt-1">
                              <Users className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                c/{item.name}
                              </h4>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {item.description}
                              </p>
                              <div className="text-xs text-gray-400 mt-1">
                                {item.membersCount} members
                              </div>
                            </div>
                          </div>
                        );
                      } else if (item.post) {
                        // Comment
                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              handleLinkClick(
                                `/c/${item.post.group.slug}/${item.post.id}`,
                              )
                            }
                            className="flex gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <div className="mt-1">
                              <MessageSquare className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-900 line-clamp-2">
                                "{item.content}"
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Comment on{" "}
                                <span className="font-medium">
                                  {item.post.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : debouncedQuery ? (
                  <div className="text-center text-gray-500 py-8">
                    No community results found
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Start typing to search community...
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
