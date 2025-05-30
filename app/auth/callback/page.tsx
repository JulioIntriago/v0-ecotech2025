"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige a /auth/login después de verificar
    router.push("/auth/login");
  }, [router]);

  return <div>Redirigiendo a la página de inicio de sesión...</div>;
}