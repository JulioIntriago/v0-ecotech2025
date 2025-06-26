"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface EmpresaContextType {
  empresaId: number | null;
  loading: boolean;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaId: null,
  loading: true,
});

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEmpresa = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/auth/login");
          return;
        }

        const { data: usuario, error } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", session.user.id)
          .single();

        if (error || !usuario) {
          console.error("Error al obtener empresa:", error);
          return;
        }

        setEmpresaId(usuario.empresa_id);
      } catch (err) {
        console.error("Error en EmpresaProvider:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        fetchEmpresa();
      }
      if (event === "SIGNED_OUT") {
        setEmpresaId(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <EmpresaContext.Provider value={{ empresaId, loading }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => useContext(EmpresaContext);