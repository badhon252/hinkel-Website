import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Middleware for secure routing and role-based access control.
 * This runs at the edge to intercept requests before rendering occurs.
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // 1. Check and Normalize Role (Handles ADMIN, admin, USER, user, etc.)
  const userRole = (token?.role as string)?.toUpperCase();

  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isGuest = !token;

  console.log("-----------------------------------------");
  console.log(`[Middleware] Request: ${pathname}`);
  console.log(`[Middleware] User State: ${isGuest ? "Guest" : userRole}`);

  // 2. Rule: Guests cannot see the Dashboard, Create Book, or Profile
  if (
    isGuest &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/create-book") ||
      pathname.startsWith("/profile"))
  ) {
    console.log(
      `Action: Guest tried to enter ${pathname} -> Redirect to Login`,
    );
    const callbackUrl = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    );
  }

  // 3. Rule: Regular Users cannot see the Dashboard
  if (isUser && pathname.startsWith("/dashboard")) {
    console.log(
      "Action: Regular User tried to enter Dashboard -> Redirect to Home",
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Rule: Admin routing adjustments (e.g., redirect from certain profile pages to dashboard if needed)
  if (
    isAdmin &&
    (pathname === "/profile/orders" || pathname === "/profile/change-password")
  ) {
    console.log("Action: Admin on profile -> Redirect to Dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow everything else
  return NextResponse.next();
}

/**
 * Matcher config to exclude static assets and internal Next.js files.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
