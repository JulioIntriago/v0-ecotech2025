import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const url = request.nextUrl.pathname;

  // Manejar el callback de autenticación (opcional, para mantener el flujo)
  if (url === "/auth/callback") {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No hay sesión después del callback, redirigiendo a /auth/login");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    console.log("Sesión encontrada después del callback, redirigiendo a /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permitir acceso a todas las rutas en desarrollo sin autenticación
  if (process.env.NODE_ENV === "development") {
    console.log("Modo desarrollo: permitiendo acceso a", url);
    return response;
  }

  // Proteger todas las rutas en producción
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !url.startsWith("/auth")) {
    console.log("Sin sesión en producción, redirigiendo a /auth/login desde", url);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|favicon.ico).*)"],
};