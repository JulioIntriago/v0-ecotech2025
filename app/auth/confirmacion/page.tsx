"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div>Procesando confirmación...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}

function ConfirmacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      supabase.auth.verifyOtp({ token_hash: token, type: "signup" })
        .then(() => router.push("/dashboard"))
        .catch(() => router.push("/auth/login?error=invalid_token"));
    } else {
      router.push("/auth/login");
    }
  }, [router, searchParams]);

  return <div>Procesando confirmación...</div>;
}