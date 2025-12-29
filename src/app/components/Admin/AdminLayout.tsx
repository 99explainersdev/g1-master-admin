"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaClipboardList,
  FaUserCircle,
  FaSignOutAlt,
  FaFileAlt,
} from "react-icons/fa";
import { signOut } from "next-auth/react";

function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer = () => setIsOpen((prev) => !prev);

  const navItems = [
    {
      name: "Quiz Management",
      href: "/admin/quiz",
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    {
    name: "Topic Management",
    href: "/admin/topics",
    icon: <FaFileAlt className="w-5 h-5" />,
  },
    {
      name: "User Management",
      href: "/admin/users",
      icon: <FaUserCircle className="w-5 h-5" />,
    },
    
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" }); // redirect to home after logout
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
          onClick={toggleDrawer}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-8">
          <Link href="/admin">
            <h2 className="text-xl font-bold text-gray-900 cursor-pointer">
              Admin
            </h2>
          </Link>
          {isMobile && (
            <button
              onClick={toggleDrawer}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={isMobile ? toggleDrawer : undefined}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={
                      isActive(item.href)
                        ? "text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    }
                  >
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-200 pt-4 mt-6 mx-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {isMobile && (
              <button
                onClick={toggleDrawer}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg"
              >
                <FaBars className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, Admin
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
