"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Smartphone } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Manejar el desplazamiento suave para enlaces de ancla
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname]);

  // Determinar la base URL para los enlaces de ancla
  const isOnLandingPage = pathname === "/";
  const getLinkHref = (section: string) => (isOnLandingPage ? `#${section}` : `/#${section}`);

  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Smartphone className="h-6 w-6" />
            <span className="text-xl font-bold">Eco_Tech</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6">
          <Link
            href={getLinkHref("servicios")}
            className="text-sm font-medium hover:text-blue-200 transition-colors"
          >
            Servicios
          </Link>
          <Link
            href={getLinkHref("nosotros")}
            className="text-sm font-medium hover:text-blue-200 transition-colors"
          >
            Nosotros
          </Link>
          <Link
            href={getLinkHref("contacto")}
            className="text-sm font-medium hover:text-blue-200 transition-colors"
          >
            Contacto
          </Link>
          <Link href="/auth/login" className="text-sm font-medium hover:text-blue-200 transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/auth/register" className="text-sm font-medium hover:text-blue-200 transition-colors">
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}