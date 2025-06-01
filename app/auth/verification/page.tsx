"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function VerificationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      if (user.emailVerified) {
        await supabase.from("users").update({ email_verified: true }).eq("id", user.uid);
        toast({ title: "Email verificado", description: "Redirigiendo..." });
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, { url: `${window.location.origin}/auth/verification` });
        toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verifica tu correo</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-success" />
          <p className="mt-4">Hemos enviado un enlace de verificación a tu correo.</p>
          <Button onClick={handleResendEmail} disabled={loading} className="mt-4">
            {loading ? "Enviando..." : "Reenviar Correo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}