"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Crown, Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"superadmin" | "empleado">("superadmin");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para verificar permisos y redirigir
  const checkPermissionsAndRedirect = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("role, empresa_id")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        throw new Error("No se encontraron datos del usuario.");
      }

      const { data: permisos, error: permError } = await supabase
        .from("permisos")
        .select("superadmin, tecnico, vendedor")
        .eq("empresa_id", userData.empresa_id)
        .single();

      if (permError || !permisos) {
        throw new Error("No se encontraron permisos para la empresa.");
      }

      const rolePermisos = permisos[userData.role as keyof typeof permisos];
      if (!rolePermisos || typeof rolePermisos !== "object") {
        throw new Error("Los permisos no están configurados correctamente.");
      }

      if (rolePermisos.dashboard) {
        router.push(`/dashboard?empresa_id=${userData.empresa_id}`);
      } else {
        throw new Error("No tienes acceso al dashboard.");
      }
    } catch (err: any) {
      await supabase.auth.signOut();
      setError(err.message || "Error al verificar permisos.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Verificar sesión al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkPermissionsAndRedirect(session.user.id);
      }
      setLoading(false);
    };
    checkSession();
  }, []); // Sin dependencias para ejecutarse solo al montar

  // Manejar login con Google para Super Admin
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode !== "superadmin") throw new Error("Solo Super Admin usa Google");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // Manejar login con correo/contraseña para empleados
  const handleEmailPasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode !== "empleado") throw new Error("Solo empleados usan correo/contraseña");

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!data.user?.id) throw new Error("No se obtuvo el ID del usuario");

      await checkPermissionsAndRedirect(data.user.id);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Login EcoTech
          </CardTitle>
          <p className="text-sm text-gray-600">Inicia sesión para gestionar tu empresa</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-around mb-4">
            <Button
              variant={mode === "superadmin" ? "default" : "outline"}
              className={`flex-1 mx-1 rounded-full transition-all duration-300 ${
                mode === "superadmin"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
              onClick={() => setMode("superadmin")}
            >
              <Crown className="mr-2 h-4 w-4" /> Admin
            </Button>
            <Button
              variant={mode === "empleado" ? "default" : "outline"}
              className={`flex-1 mx-1 rounded-full transition-all duration-300 ${
                mode === "empleado"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
              onClick={() => setMode("empleado")}
            >
              <Shield className="mr-2 h-4 w-4" /> Empleado
            </Button>
          </div>

          {mode === "superadmin" && (
            <p className="text-center text-sm text-gray-600">Crea y gestiona tu empresa</p>
          )}
          {mode === "empleado" && (
            <p className="text-center text-sm text-gray-600">Vende y crece con EcoTech</p>
          )}

          {mode === "superadmin" && (
            <div className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full flex gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300"
                disabled={loading}
              >
                <Chrome className="h-5 w-5" /> Iniciar sesión con Google
              </Button>
            </div>
          )}

          {mode === "empleado" && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@correo.com"
                    className="pl-8 border-gray-300 focus:ring-blue-600 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Ingresa tu contraseña"
                    className="pl-8 border-gray-300 focus:ring-blue-600 rounded-lg"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-300"
              >
                {loading ? "Iniciando..." : "Ingresar"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-blue-600 hover:underline">← Volver al inicio</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}