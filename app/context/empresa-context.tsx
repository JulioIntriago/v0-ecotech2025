"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EmpresaContextType = {
  empresaId: number | null;
  loading: boolean;
};

const EmpresaContext = createContext<EmpresaContextType>({
  empresaId: null,
  loading: true,
});

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider = ({ children }: { children: React.ReactNode }) => {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerEmpresaId = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error al obtener empresa_id:", error.message);
        setLoading(false);
        return;
      }

      setEmpresaId(data.empresa_id);
      setLoading(false);
    };

    obtenerEmpresaId();
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresaId, loading }}>
      {children}
    </EmpresaContext.Provider>
  );
};
