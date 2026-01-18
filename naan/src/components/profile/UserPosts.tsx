import { useRef, useEffect } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GET_USER_POSTS } from "@/queries/user";
import { MessageSquare, ArrowBigUp, ArrowBigDown } from "lucide-react";
import FormattedDate from "@/components/FormattedDate";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

interface UserPostsProps {
  username: string;
}

export default function UserPosts({ username }: UserPostsProps) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async ({ pageParam = 0 }) => {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<any>(endpoint, GET_USER_POSTS, {
      username,
      limit: PAGE_SIZE,
      offset: pageParam,
    });
    return data.user.posts;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  const allPosts = data ? data.pages.flatMap((page) => page) : [];

  const rowVirtualizer = useVirtualizer({
    count: allPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= allPosts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allPosts.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load posts. Please try again later.
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        u/{username} hasn't posted anything yet.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: "calc(100vh - 300px)", // Adjusted for profile header
        overflow: "auto",
      }}
      className="scrollbar-hide"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const post = allPosts[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-4 py-1"
            >
              <div className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex">
                  <div className="w-10 bg-gray-50/50 p-2 flex flex-col items-center rounded-l-md border-r border-gray-100">
                    <button className="text-gray-400 hover:text-orange-500 transition-colors">
                      <ArrowBigUp className="w-6 h-6" />
                    </button>
                    <span className="text-sm font-bold text-gray-700 my-1">
                      {post.upvotesCount - post.downvotesCount}
                    </span>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">
                      <ArrowBigDown className="w-6 h-6" />
                    </button>
                  </div>

                  <div
                    onClick={() =>
                      router.push(`/c/${post.group.slug}/posts/${post.id}`)
                    }
                    className="flex-1 p-3 cursor-pointer"
                  >
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Link
                        href={`/c/${post.group.slug}`}
                        className="font-bold text-gray-900 hover:underline mr-2 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="mr-1">c/{post.group.slug}</span>
                      </Link>
                      <span className="text-gray-400">•</span>
                      <span className="mx-1">
                        Posted by u/{post.author.username}
                      </span>
                      <span className="text-gray-400">
                        <FormattedDate date={post.createdAt} />
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2 leading-snug">
                      {post.title}
                    </h3>

                    <div
                      className="text-sm text-gray-500 line-clamp-3 mb-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="flex items-center text-gray-500 text-xs font-bold">
                      <div className="flex items-center hover:bg-gray-100 p-1.5 rounded transition-colors mr-2">
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                        <span>
                          {post.commentsCount} Comment
                          {post.commentsCount !== 1 && "s"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isFetchingNextPage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
            }}
            className="flex justify-center py-4"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
