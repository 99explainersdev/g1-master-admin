import { Metadata } from 'next/types';


export const metadata: Metadata = {
  title: "Nextjs Application",
  description: "Nextjs Application",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: AdminLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}