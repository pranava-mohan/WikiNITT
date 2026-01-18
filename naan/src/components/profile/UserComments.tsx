import { useRef, useEffect } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GET_USER_COMMENTS } from "@/queries/user";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import FormattedDate from "@/components/FormattedDate";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

interface UserCommentsProps {
  username: string;
}

export default function UserComments({ username }: UserCommentsProps) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  const fetchComments = async ({ pageParam = 0 }) => {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<any>(endpoint, GET_USER_COMMENTS, {
      username,
      limit: PAGE_SIZE,
      offset: pageParam,
    });
    return data.user.comments;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["userComments", username],
    queryFn: fetchComments,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  const allComments = data ? data.pages.flatMap((page) => page) : [];

  const rowVirtualizer = useVirtualizer({
    count: allComments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= allComments.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allComments.length,
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
        Failed to load comments. Please try again later.
      </div>
    );
  }

  if (allComments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        u/{username} hasn't commented on anything yet.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: "calc(100vh - 300px)",
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
          const comment = allComments[virtualRow.index];
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
              <div className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer p-4">
                <div className="text-xs text-gray-500 mb-2">
                  <span className="mr-1">Commented on</span>
                  <Link
                    href={`/c/${comment.post.group.slug}/posts/${comment.post.id}`}
                    className="font-bold text-gray-900 hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                  <span className="mx-1">in</span>
                  <Link
                    href={`/c/${comment.post.group.slug}`}
                    className="font-bold text-gray-900 hover:underline"
                  >
                    c/{comment.post.group.slug}
                  </Link>
                  <span className="mx-1">•</span>
                  <span>
                    <FormattedDate date={comment.createdAt} />
                  </span>
                </div>

                <div
                  className="text-sm text-gray-800 mb-2"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />

                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-bold mr-2">
                    {comment.upvotesCount - comment.downvotesCount} points
                  </span>
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
