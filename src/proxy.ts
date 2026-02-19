// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// /**
//  * Next.js 16 Proxy implementation for secure routing and role-based access control.
//  * This runs at the edge to intercept requests before rendering occurs.
//  */
// export async function proxy(request: NextRequest) {
//     const token = await getToken({ req: request });
//     const { pathname } = request.nextUrl;

//     // Normalization for robust RBAC
//     const userRole = (token?.role as string)?.toUpperCase();
//     const isAdmin = userRole === "ADMIN";
//     const isGuest = !token;

//     console.log("-----------------------------------------");
//     console.log(`[Proxy] Path: ${pathname}, Role: ${userRole || 'UNAUTHENTICATED'}`);

//     // 1. Guest Flow: Unauthenticated users blocked from /dashboard
//     if (isGuest && pathname.startsWith("/dashboard")) {
//         console.log("Decision: Redirect Guest to /auth/login");
//         return NextResponse.redirect(new URL("/auth/login", request.url));
//     }

//     // 2. Strict Dashboard Access: Block non-admins from /dashboard
//     if (pathname.startsWith("/dashboard") && !isAdmin) {
//         console.log(`Decision: Blocking ${userRole || 'USER'} from dashboard. Redirect to /`);
//         return NextResponse.redirect(new URL("/", request.url));
//     }

//     // 3. Admin Experience: Auto-redirect Admins from home to dashboard
//     if (isAdmin && pathname === "/") {
//         console.log("Decision: Redirect Admin to /dashboard");
//         return NextResponse.redirect(new URL("/dashboard", request.url));
//     }

//     console.log("Decision: Proceed to next()");
//     return NextResponse.next();
// }

// /**
//  * Optimization: Matcher config to exclude static assets and internal Next.js files.
//  * This ensures the proxy logic only runs on relevant application routes.
//  */
// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for:
//          * - api (API routes)
//          * - _next/static (static files)
//          * - _next/image (image optimization files)
//          * - assets (explicit public assets)
//          * - favicon.ico, sitemap.xml, robots.txt
//          */
//         "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
//         "/dashboard",
//         "/dashboard/:path*",
//     ],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // 1. Check and Normalize Role (Handles ADMIN, admin, USER, user, etc.)
  const userRole = (token?.role as string)?.toUpperCase();

  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isGuest = !token;

  console.log("-----------------------------------------");
  console.log(`[Proxy] Request: ${pathname}`);
  console.log(`[Proxy] User State: ${isGuest ? "Guest" : userRole}`);

  // 2. Rule: Guests cannot see the Dashboard or Create Book
  if (isGuest && pathname.startsWith("/dashboard")) {
    console.log(
      `Action: Guest tried to enter ${pathname} -> Redirect to Login`,
    );
    const callbackUrl = encodeURIComponent(pathname);
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

  if (
    (isAdmin && pathname === "/profile/orders") ||
    pathname === "/profile/change-password"
  ) {
    console.log("Action: Admin on profile -> Redirect to Dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Rule: Admins shouldn't be stuck on the Landing Page
  // if (isAdmin && pathname === "/") {
  //     console.log("Action: Admin on Home -> Redirect to Dashboard");
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  // Allow everything else (e.g., Users on Home, Admins on Dashboard)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
