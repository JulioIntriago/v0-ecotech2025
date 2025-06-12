"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Package,
  ClipboardList,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useEmpresa } from "@/app/context/empresa-context"; // Ajusta el path según tu estructura

// Mapa de iconos según el nombre almacenado en la base de datos
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Package,
  ClipboardList,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Calendar,
};

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
  const { empresaId, loading: empresaLoading } = useEmpresa();
  const [notificacionesData, setNotificacionesData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empresaLoading) return; // Esperar que cargue el contexto

    if (!empresaId) {
      setError("No se encontró una empresa asociada al usuario.");
      setLoading(false);
      return;
    }

    const fetchNotificaciones = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("leida", { ascending: true }) // primero no leídas
        .order("fecha", { ascending: false }); // luego más recientes

      if (error) {
        setError("Error al cargar notificaciones: " + error.message);
        setNotificacionesData([]);
      } else {
        setNotificacionesData(data || []);
      }
      setLoading(false);
    };

    fetchNotificaciones();
  }, [empresaId, empresaLoading]);

  const marcarTodasLeidas = async () => {
    if (!empresaId) return;
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

  if (empresaLoading || loading)
    return (
      <div className="flex h-screen items-center justify-center text-xl font-semibold">
        Cargando...
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-600 text-xl font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col gap-6 p-6 bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Notificaciones
          </h2>
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

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Centro de Notificaciones</CardTitle>
          <CardDescription>
            Mantente al día con las actualizaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacionesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-600 dark:text-gray-400">
                <Bell className="mb-2 h-12 w-12" />
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-sm">
                  Las notificaciones aparecerán aquí cuando haya
                  actualizaciones importantes.
                </p>
              </div>
            ) : (
              notificacionesData.map((notificacion) => {
                const iconColor =
                  notificacion.tipo === "alerta"
                    ? "text-destructive"
                    : notificacion.tipo === "exito"
                    ? "text-success"
                    : "text-primary";

                const IconComponent = iconMap[notificacion.icono];

                return (
                  <div
                    key={notificacion.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !notificacion.leida ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className={`mt-1 ${iconColor}`}>
                      {IconComponent ? (
                        <IconComponent className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notificacion.titulo}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notificacion.fecha), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notificacion.mensaje}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarLeida(notificacion.id)}
                        >
                          Marcar como leída
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={notificacion.accion}>Ver detalles</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
