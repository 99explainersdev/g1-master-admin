// proxy.js (or keep middleware.js if you want)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req, ev) {
  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // ❌ Not logged in → only allow /log
  if (!token) {
    if (pathname !== "/log") {
      return NextResponse.redirect(new URL("/log", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Logged in → only allow /admin
  if (token && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // ❌ Logged in → block login page
  if (pathname === "/log") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/log",
    "/admin/:path*",
  ],
};
