"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      router.push("/auth/login");
    };
    logout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Cerrando sesión...</p>
    </div>
  );
}