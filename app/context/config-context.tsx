// @/app/context/config-context.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ConfigContext = createContext<any>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState({
    nombreEmpresa: "Eco_Tech",
    logo: "/default-logo.png", // URL por defecto del logo
    empresaId: null,
  });

  useEffect(() => {
    async function fetchConfig() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", user.id)
        .single();
      if (usuario) {
        const fetchedEmpresaId = usuario.empresa_id;
        const { data, error } = await supabase
          .from("configuraciones")
          .select("general")
          .eq("empresa_id", fetchedEmpresaId)
          .single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching config:", error);
        } else if (data?.general) {
          setConfig({
            nombreEmpresa: data.general.nombre_empresa || "Eco_Tech",
            logo: data.general.logo || "/default-logo.png",
            empresaId: fetchedEmpresaId,
          });
        }
      }
    }

    fetchConfig();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel("config-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "configuraciones",
        },
        (payload) => {
          if (payload.new.empresa_id === config.empresaId) {
            setConfig((prev) => ({
              ...prev,
              nombreEmpresa: payload.new.general.nombre_empresa || prev.nombreEmpresa,
              logo: payload.new.general.logo || prev.logo,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [config.empresaId]);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);