"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Crown, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"superadmin" | "empleado">("superadmin");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode !== "empleado") throw new Error("Solo empleados pueden usar correo/contraseña");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      if (!data.user?.id) throw new Error("No se pudo obtener el ID del usuario");

      const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      if (!userData || !["tecnico", "vendedor"].includes(userData.role)) {
        throw new Error("Acceso denegado. Solo empleados pueden iniciar sesión.");
      }

      toast({ title: "Inicio de sesión exitoso", description: "Redirigiendo..." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (mode !== "superadmin") throw new Error("Solo el Super Admin puede usar Google");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Login Ecotech</CardTitle>
          <p className="text-sm text-gray-600">Inicia sesión</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-around mb-4">
              <Button
                variant={mode === "superadmin" ? "default" : "outline"}
                className={`flex-1 mx-1 ${mode === "superadmin" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
                onClick={() => setMode("superadmin")}
              >
                <Crown className="mr-2 h-4 w-4" /> Super Admin
              </Button>
              <Button
                variant={mode === "empleado" ? "default" : "outline"}
                className={`flex-1 mx-1 ${mode === "empleado" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
                onClick={() => setMode("empleado")}
              >
                <Shield className="mr-2 h-4 w-4" /> Empleado
              </Button>
            </div>
            {mode === "superadmin" && (
              <p className="text-center text-sm text-gray-600">Crea y gestiona tu empresa</p>
            )}
            {mode === "empleado" && (
              <p className="text-center text-sm text-gray-600">Vende y crece</p>
            )}
          </div>

          {mode === "superadmin" ? (
            <div className="space-y-4">
              <Button onClick={handleGoogleLogin} variant="outline" className="w-full flex gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" disabled={loading}>
                <Chrome className="h-5 w-5" /> Iniciar con Google
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Correo</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="border-gray-300 focus:ring-blue-600" />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="border-gray-300 focus:ring-blue-600" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                {loading ? "Iniciando..." : "Ingresar"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-blue-600 hover:underline">← Volver</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}