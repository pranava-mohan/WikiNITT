"use client";

import { useState, useEffect } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import FormattedDate from "@/components/FormattedDate";

import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql";
import { useSession } from "next-auth/react";
import {
  VOTE_COMMENT,
  CREATE_COMMENT,
  GET_REPLIES,
  UPDATE_COMMENT,
  DELETE_COMMENT,
} from "@/queries/community";
import { GET_ME } from "@/queries/user";
import { useRouter } from "next/navigation";
import { VoteType } from "@/gql/graphql";
import { request } from "graphql-request";

import Editor from "@/components/Editor";
const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false },
);

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote: VoteType;
  repliesCount: number;
  isEdited?: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  replies?: CommentData[];
}

interface CommentSectionProps {
  comments: CommentData[];
  postId: string;
}

const REPLIES_PAGE_SIZE = 5;

function ReplyLoader({
  commentId,
  repliesCount,
  postId,
  depth,
}: {
  commentId: string;
  repliesCount: number;
  postId: string;
  depth: number;
}) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["replies", commentId],
    queryFn: async ({ pageParam = 0 }) => {
      const client = getGraphQLClient(session?.backendToken);
      const result = await client.request(GET_REPLIES, {
        commentId,
        limit: REPLIES_PAGE_SIZE,
        offset: pageParam,
      });
      return result.comment?.replies || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < REPLIES_PAGE_SIZE) return undefined;
      return allPages.length * REPLIES_PAGE_SIZE;
    },
    enabled: isExpanded && !!session?.backendToken,
  });

  const allReplies = data?.pages.flatMap((page) => page) || [];

  if (repliesCount === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide replies
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
          </>
        )}
      </button>

      {isExpanded && (
        <div className="ml-2 sm:ml-4 border-l-2 border-gray-100 pl-2 sm:pl-4 mt-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading replies...
            </div>
          )}
          {isError && (
            <div className="text-red-500 text-sm py-2">
              Failed to load replies
            </div>
          )}
          {allReplies.map((reply: CommentData) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-2"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more replies"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  depth = 0,
}: {
  comment: CommentData;
  postId: string;
  depth?: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const [userVote, setUserVote] = useState(comment.userVote);
  const [voteCount, setVoteCount] = useState(
    comment.upvotes - comment.downvotes,
  );

  useEffect(() => {
    setUserVote(comment.userVote);
    setVoteCount(comment.upvotes - comment.downvotes);
  }, [comment.userVote, comment.upvotes, comment.downvotes]);

  const voteMutation = useMutation({
    mutationFn: async (type: VoteType) => {
      const client = getGraphQLClient(session?.backendToken);
      await client.request(VOTE_COMMENT, {
        commentId: comment.id,
        type,
      });
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      // Revert on error
      setUserVote(comment.userVote);
      setVoteCount(comment.upvotes - comment.downvotes);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      await client.request(CREATE_COMMENT, {
        input: {
          postId,
          parentId: comment.id,
          content: replyContent,
        },
      });
    },
    onSuccess: () => {
      setReplyContent("");
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      router.refresh();
    },
  });

  // Edit/Delete state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check if user can edit/delete
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(GET_ME);
    },
    enabled: !!session?.backendToken,
  });

  const isAuthor = session?.user?.id === comment.author.id;
  const isAdmin = meData?.me?.isAdmin ?? false;
  const canEditDelete = isAuthor || isAdmin;

  const updateCommentMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(UPDATE_COMMENT, {
        commentId: comment.id,
        content: editContent,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      router.refresh();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(DELETE_COMMENT, { commentId: comment.id });
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      router.refresh();
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

  const handleReply = () => {
    if (!session || !replyContent.trim()) return;
    replyMutation.mutate();
  };

  const maxDepth = 4;
  const atMaxDepth = depth >= maxDepth;

  return (
    <div className={`flex gap-2 mt-3 ${depth > 0 ? "mt-2" : ""}`}>
      {}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden ${
            depth > 1 ? "w-6 h-6" : "w-6 h-6 sm:w-8 sm:h-8"
          }`}
        >
          {comment.author.avatar ? (
            <Image
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-full h-full object-cover"
              width={32}
              height={32}
            />
          ) : (
            comment.author.name[0].toUpperCase()
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1 flex-wrap">
          <Link
            href={`/u/${comment.author.username}`}
            className="font-semibold text-gray-900 truncate max-w-[150px] hover:underline"
          >
            {comment.author.username || comment.author.name}
          </Link>
          <span>•</span>
          <span className="shrink-0">
            <FormattedDate date={comment.createdAt} />
          </span>
          {comment.isEdited && <span className="text-gray-400">(edited)</span>}
        </div>

        {}
        <div
          className="text-sm text-gray-800 mb-2 wrap-break-word"
          data-color-mode="light"
        >
          <Markdown source={comment.content} />
        </div>

        {}
        <div className="flex flex-wrap items-center gap-1 text-gray-500 text-xs font-medium">
          {}
          <div className="flex items-center gap-0.5 bg-gray-50 rounded-full px-1 py-0.5">
            <button
              onClick={(e) => handleVote(e, VoteType.Up)}
              className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                userVote === VoteType.Up ? "text-orange-500" : ""
              }`}
              disabled={!session}
            >
              <ArrowBigUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span
              className={`min-w-[20px] text-center ${
                voteCount > 0
                  ? "text-orange-500"
                  : voteCount < 0
                    ? "text-blue-500"
                    : ""
              }`}
            >
              {voteCount}
            </span>
            <button
              onClick={(e) => handleVote(e, VoteType.Down)}
              className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                userVote === VoteType.Down ? "text-blue-500" : ""
              }`}
              disabled={!session}
            >
              <ArrowBigDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {}
          {!atMaxDepth && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              disabled={!session}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reply</span>
            </button>
          )}

          {canEditDelete && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors text-blue-600"
                title="Edit comment"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors text-red-600"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {}
        {isReplying && (
          <div className="mt-3" data-color-mode="light">
            <Editor
              value={replyContent}
              onChange={(val) => setReplyContent(val)}
              preview="edit"
              height={120}
            />
            <div className="flex justify-end mt-2 gap-2">
              <button
                onClick={() => setIsReplying(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={replyMutation.isPending || !replyContent.trim()}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {replyMutation.isPending ? "Posting..." : "Reply"}
              </button>
            </div>
          </div>
        )}

        {}
        {comment.repliesCount > 0 && (
          <ReplyLoader
            commentId={comment.id}
            repliesCount={comment.repliesCount}
            postId={postId}
            depth={depth}
          />
        )}

        {/* Edit Modal */}
        {isEditing && (
          <div className="mt-3" data-color-mode="light">
            <Editor
              value={editContent}
              onChange={(val) => setEditContent(val)}
              preview="edit"
              height={120}
            />
            <div className="flex justify-end mt-2 gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateCommentMutation.mutate()}
                disabled={
                  updateCommentMutation.isPending || !editContent.trim()
                }
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updateCommentMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Delete Comment</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this comment? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCommentMutation.mutate()}
                  disabled={deleteCommentMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({
  comments: initialComments,
  postId,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const comments = initialComments || [];

  const commentMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      await client.request(CREATE_COMMENT, {
        input: {
          postId,
          content: newComment,
        },
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["post"] });
      router.refresh();
    },
  });

  const handleComment = () => {
    if (!session || !newComment.trim()) return;
    commentMutation.mutate();
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mt-4">
      {}
      <div className="mb-4 sm:mb-6" data-color-mode="light">
        <Editor
          value={newComment}
          onChange={(val) => setNewComment(val)}
          preview="edit"
          height={120}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleComment}
            disabled={
              commentMutation.isPending || !newComment.trim() || !session
            }
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {commentMutation.isPending ? "Posting..." : "Comment"}
          </button>
        </div>
      </div>

      {}
      <div className="max-h-[600px] overflow-y-auto">
        {comments.length > 0 ? (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                depth={0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
