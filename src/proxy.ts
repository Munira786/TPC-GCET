import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "tpc_session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

async function readSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { id: string; role: "STUDENT" | "ADMIN"; name: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  const isStudentArea = pathname.startsWith("/student");
  const isStudentLogin = pathname === "/student/login";
  const isAdminArea = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isStudentArea && !isStudentLogin) {
    if (!session || session.role !== "STUDENT") {
      const url = req.nextUrl.clone();
      url.pathname = "/student/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isStudentLogin && session?.role === "STUDENT") {
    const url = req.nextUrl.clone();
    url.pathname = "/student/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAdminArea && !isAdminLogin) {
    if (!session || session.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminLogin && session?.role === "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"],
};
