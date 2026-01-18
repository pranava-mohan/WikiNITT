"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VOTE_POST, UPDATE_POST, DELETE_POST } from "@/queries/community";
import { GET_ME } from "@/queries/user";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { getGraphQLClient } from "@/lib/graphql";
import FormattedDate from "@/components/FormattedDate";
import { VoteType, Post } from "@/gql/graphql";
import CommentSection from "./CommentSection";
import { useState, useEffect } from "react";

const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false },
);

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface PostViewProps {
  post: Post;
  showCommunityInfo?: boolean;
}

export default function PostView({
  post,
  showCommunityInfo = true,
}: PostViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [userVote, setUserVote] = useState(post.userVote);
  const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  // Fetch current user to check if admin
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(GET_ME);
    },
    enabled: !!session?.backendToken,
  });

  const isAuthor = session?.user?.id === post.author.id;
  const isAdmin = meData?.me?.isAdmin ?? false;
  const canEditDelete = isAuthor || isAdmin;

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
      setUserVote(post.userVote);
      setVoteCount(post.upvotes - post.downvotes);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(UPDATE_POST, {
        postId: post.id,
        title: editTitle,
        content: editContent,
      });
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      router.refresh();
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      return client.request(DELETE_POST, { postId: post.id });
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/c/${post.group?.slug}`);
    },
  });

  const handleVote = (type: VoteType) => {
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="shrink-0">
                {post.author.avatar ? (
                  <Image
                    className="h-10 w-10 rounded-full object-cover"
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {post.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="flex items-center text-sm text-gray-500">
                  {showCommunityInfo && (
                    <>
                      <span className="font-bold text-gray-900 hover:underline mr-2">
                        {post.group?.slug
                          ? `c/${post.group?.slug}`
                          : post.group?.name}
                      </span>
                      <span className="mr-2">•</span>
                    </>
                  )}
                  <span className="mr-2">
                    Posted by{" "}
                    <Link
                      href={`/u/${post.author.username}`}
                      className="hover:underline"
                    >
                      u/{post.author.username || post.author.name}
                    </Link>
                  </span>
                  <span>
                    <span>
                      <FormattedDate date={post.createdAt} />
                    </span>
                  </span>
                  {post.isEdited && (
                    <span className="ml-2 text-xs text-gray-400">(edited)</span>
                  )}
                </div>
              </div>
            </div>
            {canEditDelete && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div
            className="prose max-w-none text-gray-800"
            data-color-mode="light"
          >
            <Markdown source={post.content} />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <button
                onClick={() => handleVote(VoteType.Up)}
                className={`p-1 rounded hover:bg-gray-200 ${
                  userVote === VoteType.Up ? "text-orange-500" : "text-gray-500"
                }`}
              >
                <ArrowBigUp className="w-6 h-6" />
              </button>
              <span className="font-bold text-gray-700">{voteCount}</span>
              <button
                onClick={() => handleVote(VoteType.Down)}
                className={`p-1 rounded hover:bg-gray-200 ${
                  userVote === VoteType.Down ? "text-blue-500" : "text-gray-500"
                }`}
              >
                <ArrowBigDown className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center text-gray-500">
              <MessageSquare className="w-5 h-5 mr-1" />
              {post.commentsCount} Comments
            </div>
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <Share2 className="w-5 h-5 mr-1" />
              Share
            </button>
          </div>
        </div>
      </div>

      <CommentSection comments={post.comments || []} postId={post.id} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title"
              />
              <Editor
                value={editContent}
                onChange={(v) => setEditContent(v || "")}
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => updatePostMutation.mutate()}
                disabled={updatePostMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Post</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePostMutation.mutate()}
                disabled={deletePostMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
