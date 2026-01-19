import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_USER_GROUPS } from "@/queries/user";
import { GetUserGroupsQuery } from "@/gql/graphql";
import { getGraphQLClient } from "@/lib/graphql";
import { useSession } from "next-auth/react";

interface UserGroupsProps {
  username: string;
}

export default function UserGroups({ username }: UserGroupsProps) {
  const { data: session } = useSession();
  const fetchGroups = async () => {
    const client = getGraphQLClient(session?.backendToken);
    const data = await client.request(GET_USER_GROUPS, {
      username,
    });
    return data.userGroups;
  };

  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userGroups", username],
    queryFn: fetchGroups,
    enabled: !!username && !!session?.backendToken,
  });

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
        Failed to load groups. Please try again later.
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        u/{username} is not a member of any public groups.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <Link
          key={group.id}
          href={`/c/${group.slug}`}
          className="block bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                c/{group.slug}
              </h3>
              <p className="text-sm text-gray-500">
                {group.membersCount} members
              </p>
            </div>
          </div>
          {group.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {group.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
