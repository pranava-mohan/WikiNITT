import { Metadata } from "next";
import { request } from "graphql-request";
import { GET_PUBLIC_USER } from "@/queries/user";
import UserProfileClient from "@/components/profile/UserProfileClient";

async function getUser(username: string) {
  try {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:8080/query";
    const data = await request<any>(endpoint, GET_PUBLIC_USER, {
      username,
    });
    return data.user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return {
      title: "User Not Found - WikiNITT",
    };
  }

  return {
    title: `u/${user.username} - WikiNITT`,
    description:
      user.bio || `Check out u/${user.username}'s profile on WikiNITT.`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <UserProfileClient username={username} />;
}
