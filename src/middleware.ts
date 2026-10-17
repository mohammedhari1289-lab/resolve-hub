import { NextResponse, type NextRequest } from "next/server";

// Lightweight gate: redirects signed-out visitors before rendering.
// The REAL authorization (signature check, role, ownership) runs server-side in requireUser() and in every query/action.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("rh_session")?.value) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/complaints/:path*", "/admin/:path*", "/notifications/:path*"],
};
