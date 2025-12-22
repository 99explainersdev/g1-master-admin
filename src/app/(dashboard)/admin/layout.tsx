export const metadata = {
  title: "Nextjs Application",
  description: "Nextjs Application",
};

import AdminLayout from "@/app/components/Admin/AdminLayout";
import { PropsWithChildren } from "react";

export default function AdminDashboardLayout({
  children,
}: PropsWithChildren<object>) {
  return (
    <>
      <div className="max-w-[2600px] mx-auto">
        <AdminLayout>{children}</AdminLayout>
      </div>
    </>
  );
}
