import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// isProtectedRoute is a function that returns true if the route is protected
// const isProtectedRoute = createRouteMatcher(["/user-profile"]);

// isPublicRoute is a function that returns true if the route is public
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// isAdminRoute is a function that returns true if the route is admin
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// clerkMiddleware is a function that protects the route
// auth is the auth object
// req is the request object
export default clerkMiddleware(async (auth, req) => {

  // isProtectedRoute is a function that returns true if the route is protected
  // if (isProtectedRoute(req)) await auth.protect();

  // isPublicRoute is a function that returns true if the route is public
  // if (!isPublicRoute(req)) await auth.protect();

  const { userId, redirectToSignIn } = await auth();

  if (
    isAdminRoute(req) &&
    ((await auth()).sessionClaims?.metadata as { role?: string })?.role !== "admin"
  ) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  if (!userId && !isPublicRoute(req)) {
    // Add custom logic to run before redirecting

    return redirectToSignIn();
  }


});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
