import { GET_GROUPS } from "@/queries/community";
import { Query } from "@/gql/graphql";
import Link from "next/link";
import { Users, Search } from "lucide-react";

import { auth } from "@/auth";
import { getGraphQLClient } from "@/lib/graphql";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getGroups(token?: string) {
  try {
    const client = getGraphQLClient(token);
    const data = await client.request<Query>(GET_GROUPS, {
      limit: 50,
      offset: 0,
      type: "PUBLIC",
    });
    return data?.groups || [];
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: "All Communities - WikiNITT",
  description: "Browse all communities on WikiNITT.",
};

export default async function AllCommunitiesPage() {
  const session = await auth();
  const groups = await getGroups(session?.backendToken);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Communities
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse all available communities on WikiNITT.
            </p>
          </div>
          {}
          <div className="mt-4 md:mt-0 relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search communities"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/c/${group.slug}`}
              className="block group hover:shadow-lg transition-all duration-200"
            >
              <div className="bg-white overflow-hidden shadow rounded-lg h-full flex flex-col border border-gray-200 group-hover:border-indigo-300">
                <div className="px-4 py-5 sm:p-6 grow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {group.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${
                        group.type === "PUBLIC"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {group.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {group.description}
                  </p>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span>
                        {group.membersCount} member
                        {group.membersCount !== 1 && "s"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No communities found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
