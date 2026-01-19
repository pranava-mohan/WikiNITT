"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_PUBLIC_USER } from "@/queries/user";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import UserPosts from "@/components/profile/UserPosts";
import UserComments from "@/components/profile/UserComments";
import UserGroups from "@/components/profile/UserGroups";

interface UserProfileClientProps {
  username: string;
}

export default function UserProfileClient({
  username,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "groups">(
    "posts",
  );

  const fetchUser = async () => {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<any>(endpoint, GET_PUBLIC_USER, {
      username,
    });
    return data.user;
  };

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["publicUser", username],
    queryFn: fetchUser,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p>The user u/{username} does not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader user={user} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
              activeTab === "posts"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
              activeTab === "comments"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
              activeTab === "groups"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Groups
          </button>
        </div>

        {}
        <div className="p-4 bg-gray-50 min-h-125">
          {activeTab === "posts" && <UserPosts username={username} />}
          {activeTab === "comments" && <UserComments username={username} />}
          {activeTab === "groups" && <UserGroups username={username} />}
        </div>
      </div>
    </div>
  );
}
