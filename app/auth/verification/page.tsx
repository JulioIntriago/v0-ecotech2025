"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login"); // Redirige a login si no hay sesión
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <CardTitle className="text-2xl">Verifica tu correo</CardTitle>
          <CardDescription>Hemos enviado un enlace de verificación a tu correo electrónico.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta. Si no encuentras
            el correo, revisa tu carpeta de spam.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">Volver al inicio de sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}