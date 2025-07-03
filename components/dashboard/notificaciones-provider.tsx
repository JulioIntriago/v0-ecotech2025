"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/app/context/empresa-context";

interface Notificacion {
  id: string;
  tipo: "alerta" | "info" | "exito";
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion: string;
  icono: string;
  empresa_id: number;
}

interface NotificacionesContextType {
  notificacionesData: Notificacion[];
  noLeidas: number;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined);

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error("useNotificaciones debe ser usado dentro de un NotificacionesProvider");
  }
  return context;
};

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const { empresaId, loading: empresaLoading } = useEmpresa();
  const [notificacionesData, setNotificacionesData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotificaciones() {
      if (empresaLoading || !empresaId) {
        setLoading(true);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("leida", { ascending: true }) // Primero no leídas
          .order("fecha", { ascending: false }); // Luego más recientes
        if (error) {
          console.error("Error fetching notificaciones:", error);
        } else {
          setNotificacionesData(data || []);
        }
      } catch (err) {
        console.error("Error en fetchNotificaciones:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotificaciones();

    if (empresaId) {
      const channel = supabase
        .channel(`notif-changes-${empresaId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notificaciones", filter: `empresa_id=eq.${empresaId}` },
          (payload) => {
            console.log("Nueva notificación:", payload.new);
            setNotificacionesData((prev) => [payload.new as Notificacion, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notificaciones", filter: `empresa_id=eq.${empresaId}` },
          (payload) => {
            console.log("Notificación actualizada:", payload.new);
            setNotificacionesData((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notificacion) : n))
            );
          }
        )
        .subscribe((status) => {
          console.log("Suscripción notificaciones estado:", status);
        });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [empresaId, empresaLoading]);

  const marcarTodasLeidas = async () => {
    if (!empresaId || !notificacionesData.length) return;
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("empresa_id", empresaId)
      .eq("leida", false);
    if (error) {
      console.error("Error marcando todas como leídas:", error);
    } else {
      setNotificacionesData((prev) => prev.map((n) => ({ ...n, leida: true })));
    }
  };

  const marcarLeida = async (id: string) => {
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id", id);
    if (error) {
      console.error("Error marcando como leída:", error);
    } else {
      setNotificacionesData((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    }
  };

  const noLeidas = notificacionesData.filter((n) => !n.leida).length;

  return (
    <NotificacionesContext.Provider
      value={{ notificacionesData, noLeidas, marcarLeida, marcarTodasLeidas }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}