"use client";

import { useEffect } from "react";
import { GET_GROUP_BY_SLUG } from "@/queries/community";
import { Query } from "@/gql/graphql";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Users, Calendar, Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { EditGroupModal } from "@/components/community/EditGroupModal";

import { useSession } from "next-auth/react";
import { getGraphQLClient } from "@/lib/graphql";
import CommunityLoginPrompt from "@/components/CommunityLoginPrompt";
import JoinGroupButton from "@/components/community/JoinGroupButton";
import PostCard from "@/components/community/PostCard";
import { useQuery } from "@tanstack/react-query";

export default function GroupPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session, status } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group", slug],
    queryFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      const data = await client.request<Query>(GET_GROUP_BY_SLUG, {
        slug,
        postLimit: 20,
        postOffset: 0,
      });
      return data?.group;
    },
    enabled: !!slug && status !== "loading",
  });

  useEffect(() => {
    if (group) {
      document.title = `${group.name} - Wikinitt`;
    } else if (error || (group === null && !isLoading)) {
      document.title = "Group Not Found - Wikinitt";
    }
  }, [group, error, isLoading]);

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

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-lg text-gray-600">Group not found</p>
          <Link
            href="/c"
            className="text-indigo-600 hover:underline mt-4 block"
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = group.owner.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="h-32 bg-indigo-600"></div>
          <div className="px-4 py-5 sm:px-6 relative">
            <div className="-mt-16 sm:-mt-20 mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1 shadow-lg relative overflow-hidden">
                {(group as any).icon ? (
                  <Image
                    src={(group as any).icon}
                    alt={group.name}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="sm:flex sm:justify-between sm:items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {group.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {group.description}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {group.membersCount} members
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created{" "}
                    {new Date(group.createdAt).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {isOwner && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <JoinGroupButton
                  groupId={group.id}
                  initialIsMember={group.isMember}
                  isOwner={isOwner}
                />
                {group.isMember ? (
                  <Link
                    href={`/c/${group.slug}/create`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Post
                  </Link>
                ) : (
                  <div className="group relative inline-flex items-center">
                    <span className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                      Create Post
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Join group to post
                    </div>
                  </div>
                )}
                {group.isMember && (
                  <Link
                    href={`/c/${group.slug}/discussion`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Discussion
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {group.posts.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                No posts yet. Be the first to post!
              </div>
            ) : (
              group.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as any}
                  groupSlug={group.slug}
                  showCommunityInfo={false}
                />
              ))
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">
                    {new Date(group.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900 capitalize">
                    {group.type.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(group as any) && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={{
            id: group.id,
            name: group.name,
            description: group.description,
            icon: (group as any).icon,
            slug: group.slug,
          }}
        />
      )}
    </div>
  );
}
