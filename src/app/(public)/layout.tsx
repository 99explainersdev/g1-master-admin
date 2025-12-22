import type { Metadata } from "next";
import AuthProvider from "./../../Providers/AuthProvider";

export const metadata: Metadata = {
  title: "Nextjs App",
  description: "Nextjs App",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
