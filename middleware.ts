import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Public files and fonts — must not be redirected or the Max 2 shell breaks. */
const STATIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest|woff2?)$/i

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/max-2")) {
    return NextResponse.next()
  }
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }
  if (STATIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/max-2"
  url.search = ""
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next/).*)"],
}
