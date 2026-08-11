import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/configs/auth.config";
import {
  authRoutes as _authRoutes,
  publicRoutes as _publicRoutes,
} from "@/configs/routes.config";
import { REDIRECT_URL_KEY } from "@/constants/app.constant";
import appConfig from "@/configs/app.config";

const { auth } = NextAuth(authConfig);

// Convert route objects to arrays
const publicRoutes = Object.keys(_publicRoutes);
const authRoutes = Object.keys(_authRoutes);

// NextAuth API prefix (must be skipped)
const apiAuthPrefix = `${appConfig.apiPrefix}/auth`;

const BASE_PATH = "";

export default auth((req) => {
  const { nextUrl } = req;

  // TRUE if session exists
  const isSignedIn = !!req.auth;

  // nextUrl.pathname includes the basePath; strip it for route matching
  const rawPathname = nextUrl.pathname.startsWith(BASE_PATH)
    ? nextUrl.pathname.slice(BASE_PATH.length) || "/"
    : nextUrl.pathname;

  const isApiAuthRoute = rawPathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some(
    (route) =>
      rawPathname === route ||
      rawPathname.startsWith(route + "/")
  );

  const isAuthRoute = authRoutes.includes(rawPathname);

  /** 1️⃣ Skip NextAuth internal API routes */
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  /** 2️⃣ Auth pages (sign-in, sign-up) */
  if (isAuthRoute) {
    if (isSignedIn) {
      return NextResponse.redirect(
        new URL(BASE_PATH + appConfig.authenticatedEntryPath, nextUrl)
      );
    }
    return NextResponse.next();
  }

  /** 3️⃣ Protected routes */
  if (!isSignedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;

    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(
        `${BASE_PATH}${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${callbackUrl}`,
        nextUrl
      )
    );
  }

  /** 4️⃣ Allow everything else */
  return NextResponse.next();
});

export const config = {
  // SAME MATCHER (unchanged to avoid breaking behavior)
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
