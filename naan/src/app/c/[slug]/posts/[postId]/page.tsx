"use client";

import { useEffect } from "react";
import { GET_POST } from "@/queries/community";
import { Query } from "@/gql/graphql";
import { notFound, useParams } from "next/navigation";
import PostView from "@/components/community/PostView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useSession } from "next-auth/react";
import { getGraphQLClient } from "@/lib/graphql";
import CommunityLoginPrompt from "@/components/CommunityLoginPrompt";
import { useQuery } from "@tanstack/react-query";

export default function PostPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { data: session, status } = useSession();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      const data = await client.request<Query>(GET_POST, {
        id: postId,
      });
      return data?.post;
    },
    enabled: !!postId && status !== "loading",
  });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - WikiNITT`;
    } else if (error || (post === null && !isLoading)) {
      document.title = "Post Not Found - WikiNITT";
    }
  }, [post, error, isLoading]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <CommunityLoginPrompt />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-lg text-gray-600">Post not found</p>
          <Link
            href={`/c/${slug}`}
            className="text-indigo-600 hover:underline mt-4 block"
          >
            Back to {slug}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {post.group.name}
          </Link>
        </div>
        <PostView post={post} showCommunityInfo={false} />
      </div>
    </div>
  );
}
