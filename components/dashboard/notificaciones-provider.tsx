"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface Notificacion {
  id: string;
  tipo: "alerta" | "info" | "exito";
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion: string;
  icono: string;
}

interface NotificacionesContextType {
  notificacionesData: Notificacion[];
  noLeidas: number;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined)

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext)
  if (!context) {
    throw new Error("useNotificaciones debe ser usado dentro de un NotificacionesProvider")
  }
  return context
}

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [notificacionesData, setNotificacionesData] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .order("fecha", { ascending: false })
        .order("leida", { ascending: true })

      if (error) {
        console.error("Error fetching notificaciones:", error)
      } else {
        setNotificacionesData(data || [])
      }
      setLoading(false)
    }

    fetchNotificaciones()

    const subscription = supabase
      .channel("notificaciones")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificaciones" },
        (payload) => {
          setNotificacionesData((prev) => [payload.new as Notificacion, ...prev])
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notificaciones" },
        (payload) => {
          setNotificacionesData((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new as Notificacion : n)),
          )
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const marcarTodasLeidas = async () => {
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("leida", false)

    if (error) {
      console.error("Error marking all as read:", error)
    } else {
      setNotificacionesData(
        notificacionesData.map((notificacion) => ({
          ...notificacion,
          leida: true,
        })),
      )
    }
  }

  const marcarLeida = async (id: string) => {
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id", id)

    if (error) {
      console.error("Error marking as read:", error)
    } else {
      setNotificacionesData(
        notificacionesData.map((notificacion) =>
          notificacion.id === id ? { ...notificacion, leida: true } : notificacion,
        ),
      )
    }
  }

  const noLeidas = notificacionesData.filter((n) => !n.leida).length

  return (
    <NotificacionesContext.Provider
      value={{ notificacionesData, noLeidas, marcarLeida, marcarTodasLeidas }}
    >
      {children}
    </NotificacionesContext.Provider>
  )
}