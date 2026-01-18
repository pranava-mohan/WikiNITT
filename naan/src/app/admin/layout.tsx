import AdminSidebar from "./components/AdminSidebar";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - WikiNITT",
  description: "Administrative tools for managing WikiNITT.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      {}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
