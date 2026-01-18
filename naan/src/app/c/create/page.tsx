import CreateGroupForm from "@/components/community/CreateGroupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Community - WikiNITT",
  description: "Create a new community on WikiNITT.",
};

export default function CreateGroupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create a New Community
          </h1>
          <CreateGroupForm />
        </div>
      </div>
    </div>
  );
}
