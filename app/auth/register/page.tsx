// app/auth/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    telefono: "",
  });
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.from("users").select("role").eq("role", "admin").limit(1);
      if (data && data.length === 0) setIsInitialSetup(true);
    };
    checkAdmin();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            role: isInitialSetup ? "admin" : "cliente",
            email_verified: false,
            phone_verified: false,
          },
        },
      });

      if (error) throw error;

      const { error: userError } = await supabase.from("users").insert({
        id: data.user?.id,
        email: formData.email,
        role: isInitialSetup ? "admin" : "cliente",
        nombre: formData.nombre,
        telefono: formData.telefono,
      });

      if (userError) throw userError;

      toast({
        title: isInitialSetup ? "Admin configurado" : "Registro exitoso",
        description: "Verifica tu email para continuar.",
      });
      router.push("/auth/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isInitialSetup ? "Configurar Admin Inicial" : "Registro de Cliente"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Procesando..." : isInitialSetup ? "Configurar Admin" : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}