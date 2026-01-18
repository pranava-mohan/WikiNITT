"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_GROUPS } from "@/queries/community";
import { Query } from "@/gql/graphql";
import { useSession } from "next-auth/react";
import { getGraphQLClient } from "@/lib/graphql";

export default function MobileCommunityList() {
  const { data: session } = useSession();
  const { data: groups, isLoading } = useQuery({
    queryKey: ["publicGroups"],
    queryFn: async () => {
      const client = getGraphQLClient(session?.backendToken);
      const data = await client.request<Query>(GET_GROUPS, {
        limit: 10,
        offset: 0,
      });
      return data.groups.filter((g) => g.type === "PUBLIC");
    },
    enabled: !!session?.backendToken,
  });

  const { data: myGroups, isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["myGroups", session?.user?.id],
    queryFn: async () => {
      if (!session?.backendToken) return [];
      const client = getGraphQLClient(session.backendToken);
      const data = await client.request<Query>(GET_GROUPS, {
        limit: 10,
        offset: 0,
        ownerId: session.user.id,
      });
      return data.groups;
    },
    enabled: !!session?.backendToken,
  });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="shrink-0 w-32 h-12 bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Link
        href="/c/create"
        className="flex items-center justify-center w-full p-3 mb-6 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Community
      </Link>

      {session?.user && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            My Communities
          </h2>
          {isLoadingMyGroups ? (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-32 h-12 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : myGroups && myGroups.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {myGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/c/${group.slug}`}
                  className="shrink-0 flex items-center bg-white border border-gray-200 rounded-lg p-2 pr-4 shadow-sm hover:shadow-md transition-shadow active:scale-95 transform duration-100"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 shrink-0">
                    <span className="font-bold text-xs">
                      {group.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      c/{group.slug}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {group.membersCount} members
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 px-1 italic">
              You haven't created any communities yet.
            </div>
          )}
        </div>
      )}

      {groups && groups.length > 0 && (
        <>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Popular Communities
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/c/${group.slug}`}
                className="shrink-0 flex items-center bg-white border border-gray-200 rounded-lg p-2 pr-4 shadow-sm hover:shadow-md transition-shadow active:scale-95 transform duration-100"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 shrink-0">
                  <span className="font-bold text-xs">
                    {group.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    c/{group.slug}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {group.membersCount} members
                  </span>
                </div>
              </Link>
            ))}
            <Link
              href="/c/all"
              className="shrink-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-2 px-4 shadow-sm hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                View All
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
