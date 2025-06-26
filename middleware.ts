import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Aquí puedes aplicar lógica de autenticación, redirección, etc.
  return NextResponse.next();
}

// Opcionalmente, puedes definir qué rutas usarán este middleware
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"], // ajusta según tus rutas
};
