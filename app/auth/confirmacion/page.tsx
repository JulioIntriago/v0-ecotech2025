// app/auth/confirmacion/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfirmacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      supabase.auth.verifyOtp({ token_hash: token, type: 'signup' })
        .then(() => router.push('/dashboard'))
        .catch(() => router.push('/auth/login?error=invalid_token'));
    } else {
      router.push('/auth/login');
    }
  }, []);

  return <div>Procesando confirmación...</div>;
}