import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (user) {
    const { data: userData } = await supabase.from("users").select("role, email_verified").eq("id", user.id).single();
    if (!userData?.email_verified && pathname !== "/auth/verification") {
      return NextResponse.redirect(new URL("/auth/verification", req.url));
    }
    if (userData?.role !== "admin" && pathname.startsWith("/dashboard/empleados")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (userData?.role === "cliente" && pathname !== "/" && !pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/"],
};