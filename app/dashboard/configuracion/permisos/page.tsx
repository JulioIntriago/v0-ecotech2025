import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("Middleware - Pathname:", pathname);

  // Obtener token
  const token =
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    req.cookies.get("sb-access-token")?.value;

  console.log("Middleware - Token:", token ? "[present]" : "[missing]");

  // Redirigir a login si no hay token y la ruta es protegida
  if (!token && pathname.startsWith("/dashboard")) {
    console.log("Middleware - No token found, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Validar usuario con Supabase
  const { data: { user } = {}, error: userError } = await supabase.auth.getUser(token);

  console.log("Middleware - User ID:", user?.id || "[none]");
  console.log("Middleware - User Error:", userError?.message || "[none]");

  if (userError || !user) {
    if (pathname.startsWith("/dashboard")) {
      console.log("Middleware - Invalid user, redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Obtener rol y empresa_id desde usuarios
  const { data: userData, error: fetchError } = await supabase
    .from("usuarios")
    .select("rol, empresa_id")
    .eq("id", user.id)
    .single();

  console.log("Middleware - UserData:", userData);
  console.log("Middleware - Fetch Error:", fetchError?.message || "[none]");

  if (fetchError || !userData || !userData.empresa_id) {
    if (pathname.startsWith("/dashboard")) {
      console.log("Middleware - No user data or empresa_id, redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Añadir empresa_id a headers para todas las rutas dashboard
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-empresa-id", userData.empresa_id.toString());

  // Para rol 'dueño', también añadir como query param
  if (userData.rol === "dueño" && pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone();
    url.searchParams.set("empresa_id", userData.empresa_id.toString());
    return NextResponse.rewrite(url, { headers: requestHeaders });
  }

  return NextResponse.next({ headers: requestHeaders });
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/"],
};