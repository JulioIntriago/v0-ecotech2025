"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.session.user.id)
            .single();

          if (!userData || userData.role !== "admin") {
            throw new Error("Acceso denegado. Solo el Super Admin puede iniciar sesión con Google.");
          }

          toast({ title: "Inicio de sesión exitoso", description: "Redirigiendo..." });
          router.push("/dashboard");
        } else {
          throw new Error("No se pudo autenticar.");
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push("/auth/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Procesando Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando...</p>
        </CardContent>
      </Card>
    </div>
  );
}