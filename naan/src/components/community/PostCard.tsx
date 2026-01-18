"use client";

import Link from "next/link";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Flag,
} from "lucide-react";
import FormattedDate from "@/components/FormattedDate";
import { Post } from "@/data/community";
import { useMutation } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql";
import { useSession } from "next-auth/react";
import { VOTE_POST } from "@/queries/community";
import { useRouter } from "next/navigation";
import { VoteType } from "@/gql/graphql";
import { useState, useEffect } from "react";

interface PostCardProps {
  post: Post;
  groupSlug: string;
  compact?: boolean;
  showCommunityInfo?: boolean;
}

export default function PostCard({
  post,
  groupSlug,
  compact = false,
  showCommunityInfo = true,
}: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [userVote, setUserVote] = useState(post.userVote);
  const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);

  useEffect(() => {
    setUserVote(post.userVote);
    setVoteCount(post.upvotes - post.downvotes);
  }, [post.userVote, post.upvotes, post.downvotes]);

  const voteMutation = useMutation({
    mutationFn: async (type: VoteType) => {
      const client = getGraphQLClient(session?.backendToken);
      await client.request(VOTE_POST, {
        postId: post.id,
        type,
      });
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      // Revert on error
      setUserVote(post.userVote);
      setVoteCount(post.upvotes - post.downvotes);
    },
  });

  const handleVote = (e: React.MouseEvent, type: VoteType) => {
    e.preventDefault();
    if (!session) return;

    const currentVote = userVote;
    let newVote = type;
    let newVoteCount = voteCount;

    if (currentVote === type) {
      newVote = VoteType.None;
      if (type === VoteType.Up) newVoteCount--;
      else newVoteCount++;
    } else {
      if (currentVote === VoteType.Up) newVoteCount--;
      else if (currentVote === VoteType.Down) newVoteCount++;

      newVote = type;
      if (newVote === VoteType.Up) newVoteCount++;
      else newVoteCount--;
    }

    setUserVote(newVote);
    setVoteCount(newVoteCount);
    voteMutation.mutate(newVote);
  };

  return (
    <div className="flex bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer mb-2">
      {/* Vote Section */}
      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-l-md w-10 sm:w-12 border-r border-gray-100">
        <button
          onClick={(e) => handleVote(e, VoteType.Up)}
          className={`hover:bg-gray-200 p-1 rounded ${
            userVote === VoteType.Up ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <ArrowBigUp className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-gray-700 my-1">
          {voteCount}
        </span>
        <button
          onClick={(e) => handleVote(e, VoteType.Down)}
          className={`hover:bg-gray-200 p-1 rounded ${
            userVote === VoteType.Down ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <ArrowBigDown className="w-6 h-6" />
        </button>
      </div>

      {}
      <div className="flex-1 p-2 sm:p-3">
        {}
        <div className="flex items-center text-xs text-gray-500 mb-2">
          {showCommunityInfo && (
            <>
              <span className="font-bold text-gray-900 hover:underline mr-2">
                {post.community || (post as any).group?.slug
                  ? `c/${(post as any).group?.slug}`
                  : (post as any).group?.name}
              </span>
              <span className="mr-2">•</span>
            </>
          )}
          <span className="mr-2">
            Posted by{" "}
            <Link
              href={`/u/${
                typeof post.author === "object"
                  ? (post.author as any).username
                  : post.author
              }`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              u/
              {typeof post.author === "object"
                ? (post.author as any).username
                : post.author}
            </Link>
          </span>
          <span>
            {(post as any).createdAt ? (
              <FormattedDate date={(post as any).createdAt} />
            ) : (
              post.timestamp
            )}
          </span>
        </div>

        {}
        <Link href={`/c/${groupSlug}/posts/${post.id}`} className="block group">
          <h3 className="text-lg font-medium text-gray-900 group-hover:underline mb-2">
            {post.title}
          </h3>
          {!compact && (
            <div className="text-sm text-gray-600 line-clamp-3 mb-3">
              {post.content}
            </div>
          )}
        </Link>

        {}
        <div className="flex items-center space-x-2 text-gray-500 text-xs font-bold">
          <Link
            href={`/c/${groupSlug}/posts/${post.id}`}
            className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount} Comments</span>
          </Link>
          <button className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded transition-colors">
            <Flag className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
