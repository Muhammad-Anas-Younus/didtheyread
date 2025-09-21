import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("token");

    if (!token && request.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const verifyRes = token ? await verifyJwtToken(token.value) : null;

    if (verifyRes && request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
