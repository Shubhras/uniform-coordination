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

const publicRoutes = Object.keys(_publicRoutes);
const authRoutes = Object.keys(_authRoutes);

const apiAuthPrefix = `${appConfig.apiPrefix}/auth`;

export default auth((req) => {
  const { nextUrl } = req;
  const isSignedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some(
    (route) =>
      nextUrl.pathname === route ||
      nextUrl.pathname.startsWith(route + "/")
  );

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  /** 1️⃣ Skip API auth routes */
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  /** 2️⃣ Auth pages (login, register) */
  if (isAuthRoute) {
    if (isSignedIn) {
      return NextResponse.redirect(
        new URL(appConfig.authenticatedEntryPath, nextUrl)
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
        `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${callbackUrl}`,
        nextUrl
      )
    );
  }

  /** 4️⃣ ALLOW REQUEST ✅ (THIS WAS MISSING) */
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
