"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      try {
        console.log("Paso 0 - Processing OAuth callback");
        const hash = window.location.hash;
        console.log("Paso 1 - Hash:", hash);
        if (!hash) throw new Error("No hash in URL");

        // Llamar a la ruta API para manejar la sesión
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash }),
        });

        const data = await response.json();
        console.log("Paso 2 - API Response:", data);
        if (!response.ok) throw new Error(data.error || "Error en la autenticación");

        console.log("Paso 3 - Redirecting to dashboard with empresa_id:", data.empresaId);
        router.push(`/dashboard?empresa_id=${data.empresaId}`);
      } catch (error) {
        console.error("Error in handleAuth:", error);
        router.push("/auth/login");
      }
    }
    handleAuth();
  }, [router]);

  return <p>Autenticando...</p>;
}