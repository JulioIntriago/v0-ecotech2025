"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Crown, Shield } from "lucide-react";

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
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        router.push("/auth/verification");
        return;
      }

      const { data: userData } = await supabase.from("users").select("role").eq("id", user.uid).single();
      if (!userData) throw new Error("Usuario no encontrado");

      if (!["tecnico", "vendedor"].includes(userData.role)) {
        throw new Error("Acceso denegado. Solo empleados pueden iniciar sesión con correo y contraseña.");
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
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.uid).single();
      if (!existingUser) {
        throw new Error("Usuario no registrado. Contacta al administrador.");
      }

      if (!user.emailVerified) {
        router.push("/auth/verification");
        return;
      }

      if (existingUser.role !== "admin") {
        throw new Error("Acceso denegado. Solo el Super Admin puede iniciar sesión con Google.");
      }

      toast({ title: "Inicio de sesión exitoso", description: "Redirigiendo..." });
      router.push("/dashboard");
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
          <CardTitle className="text-2xl font-bold text-gray-800">Eco_Tech - Acceso</CardTitle>
          <p className="text-sm text-gray-600">Iniciar sesión como equipo</p>
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
              <p className="text-center text-sm text-gray-600">Crea y gestiona tu empresa (solo Google)</p>
            )}
            {mode === "empleado" && (
              <p className="text-center text-sm text-gray-600">Vende y crece (correo y contraseña)</p>
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