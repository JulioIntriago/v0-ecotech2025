"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/app/context/empresa-context";

interface Permisos {
  verDashboard: boolean;
  editarUsuarios: boolean;
  gestionarOrdenes: boolean;
}

interface PermisosContextType {
  permisos: Permisos | null;
}

const PermisosContext = createContext<PermisosContextType>({ permisos: null });

export const usePermisos = () => useContext(PermisosContext);

export function PermisosProvider({ children }: { children: React.ReactNode }) {
  const { empresaId } = useEmpresa();
  const [permisos, setPermisos] = useState<Permisos | null>(null);

  useEffect(() => {
    const fetchPermisos = async () => {
      if (!empresaId) return;
      const { data } = await supabase
        .from("permisos")
        .select("*")
        .eq("empresa_id", empresaId)
        .single();
      setPermisos(data?.vendedor || { verDashboard: true, editarUsuarios: false, gestionarOrdenes: false });
    };
    fetchPermisos();
  }, [empresaId]);

  return <PermisosContext.Provider value={{ permisos }}>{children}</PermisosContext.Provider>;
}