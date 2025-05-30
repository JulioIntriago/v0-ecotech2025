"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Bell, CheckCircle, AlertCircle, Package, ClipboardList, ShoppingCart, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Mapa de iconos según el nombre almacenado en la base de datos
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Package,
  ClipboardList,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Calendar,
}

// Definir la interfaz para Notificacion
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

export default function NotificacionesPage() {
  const [notificacionesData, setNotificacionesData] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar notificaciones iniciales y suscribirse a cambios en tiempo real
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

    // Suscripción a cambios en tiempo real
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

    // Limpieza de la suscripción al desmontar el componente
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Marcar todas como leídas
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

  // Marcar una notificación como leída
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

  // Contar notificaciones no leídas
  const noLeidas = notificacionesData.filter((n) => !n.leida).length

  if (loading) return <div>Cargando...</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Notificaciones</h2>
          {noLeidas > 0 && (
            <Badge variant="default" className="ml-2">
              {noLeidas} nuevas
            </Badge>
          )}
        </div>
        {noLeidas > 0 && (
          <Button variant="outline" onClick={marcarTodasLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centro de Notificaciones</CardTitle>
          <CardDescription>Mantente al día con las actualizaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacionesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Las notificaciones aparecerán aquí cuando haya actualizaciones importantes.
                </p>
              </div>
            ) : (
              notificacionesData.map((notificacion) => {
                const iconColor =
                  notificacion.tipo === "alerta"
                    ? "text-destructive"
                    : notificacion.tipo === "exito"
                      ? "text-success"
                      : "text-primary"

                const IconComponent = iconMap[notificacion.icono]

                return (
                  <div
                    key={notificacion.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !notificacion.leida ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className={`mt-1 ${iconColor}`}>
                      {IconComponent ? <IconComponent className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notificacion.titulo}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notificacion.fecha), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notificacion.leida && (
                        <Button variant="ghost" size="sm" onClick={() => marcarLeida(notificacion.id)}>
                          Marcar como leída
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={notificacion.accion}>Ver detalles</Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}