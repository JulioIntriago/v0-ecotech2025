"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cedula, setCedula] = useState("");
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error: checkError } = await supabase
        .from("users")
        .select("role")
        .eq("role", "admin")
        .limit(1);
      if (checkError) {
        console.error("Error checking admin:", checkError);
        setIsInitialSetup(true);
      } else if (data && data.length === 0) {
        setIsInitialSetup(true);
      } else {
        setIsInitialSetup(false);
      }
    };
    checkAdmin();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NODE_ENV === "development"
            ? "http://localhost:3000/auth/confirm"
            : "https://tu-dominio.com/auth/confirm",
          data: {
            nombre,
            role: isInitialSetup ? "admin" : "cliente",
            cedula,
            telefono,
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("No se pudo registrar el usuario");

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email,
        role: isInitialSetup ? "admin" : "cliente",
        cedula,
        nombre,
        telefono,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      toast({
        title: "Registro exitoso",
        description:
          process.env.NODE_ENV === "development"
            ? "Puedes iniciar sesión directamente (desarrollo)."
            : "Revisa tu correo para confirmar tu cuenta.",
      });
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Error al registrar. Revisa los logs.");
      toast({
        title: "Error",
        description: err.message || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NODE_ENV === "development"
            ? "http://localhost:3000/auth/callback"
            : "https://tu-dominio.com/auth/callback",
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google register error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Error al registrar con Google",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isInitialSetup ? "Configurar Administrador Inicial" : "Registrarse"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isInitialSetup
              ? "Registra el primer administrador del sistema."
              : "Crea una cuenta para comenzar."}
          </p>
        </CardHeader>
        <CardContent>
          <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrando..." : "Registrar"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">o</div>
            <Button
              onClick={handleGoogleRegister}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border border-gray-300"
              disabled={loading}
            >
              <Chrome className="h-5 w-5 text-gray-600" />
              <span>Registrarse con Google</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="link" asChild>
            <Link href="/">Volver a la página principal</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/auth/login">¿Ya tienes cuenta? Inicia sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}