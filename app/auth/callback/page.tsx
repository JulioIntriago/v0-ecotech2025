"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error en callback:", error.message);
        toast({
          title: "Error",
          description: "Error al procesar la autenticación con Google",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      if (data.session) {
        const user = data.session.user;
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          const { data: adminCheck } = await supabase
            .from("users")
            .select("role")
            .eq("role", "admin")
            .limit(1);

          const isInitialSetup = !adminCheck || adminCheck.length === 0;
          const role = isInitialSetup ? "admin" : "cliente";

          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            nombre: user.user_metadata.full_name || "Usuario",
            role,
            telefono: "",
            cedula: "",
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error al insertar usuario:", insertError.message);
            toast({
              title: "Error",
              description: "Error al registrar usuario en la base de datos",
              variant: "destructive",
            });
            router.push("/auth/login");
            return;
          }
        }

        toast({
          title: "Inicio de sesión exitoso",
          description: "Redirigiendo al dashboard...",
        });
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Procesando autenticación...</h1>
              <p className="text-sm text-muted-foreground">Esto puede tomar un momento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}