"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Printer, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

// Interfaces para tipar los datos
interface HistorialItem {
  id: string;
  fecha: string;
  estado: string;
  descripcion: string;
  usuario: string;
}

interface Orden {
  id: string;
  cliente_nombre: string;
  telefono_cliente?: string;
  correo_cliente?: string;
  dispositivo: string;
  modelo: string;
  problema: string;
  estado: string;
  fecha_ingreso: string;
  fecha_entrega?: string;
  costo_estimado: string;
  tecnico_asignado?: string;
  notas?: string;
  historial?: HistorialItem[];
}

function traducirEstado(estado: string): string {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
  };
  return traducciones[estado] || estado;
}

function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  };
  return variantes[estado] || "default";
}

export default function DetalleOrdenPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [comentario, setComentario] = useState("");
  const [orden, setOrden] = useState<Orden | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("ordenes")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setOrden(data);
        setNuevoEstado(data.estado);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({ title: "Error", description: "No se pudo cargar la orden.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const handleActualizarEstado = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ordenes")
        .update({ estado: nuevoEstado, notas: comentario || orden?.notas })
        .eq("id", params.id);

      if (error) throw error;

      setOrden((prev) => (prev ? { ...prev, estado: nuevoEstado, notas: comentario || prev.notas } : null));
      setOpenDialog(false);
      toast({ title: "Éxito", description: "Estado actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarOrden = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.")) {
      setLoading(true);
      try {
        const { error } = await supabase.from("ordenes").delete().eq("id", params.id);
        if (error) throw error;
        router.push("/dashboard/ordenes");
        toast({ title: "Éxito", description: "Orden eliminada correctamente." });
      } catch (error) {
        console.error("Error al eliminar la orden:", error);
        toast({ title: "Error", description: "No se pudo eliminar la orden.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="p-6">Cargando orden...</div>;
  if (!orden) return <div className="p-6">Orden no encontrada.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/ordenes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Orden #{params.id}</h2>
          <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ordenes/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm">Actualizar Estado</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar Estado de la Orden</DialogTitle>
                <DialogDescription>
                  Cambia el estado de la orden y añade un comentario sobre la actualización.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentario">Comentario</Label>
                  <Textarea
                    id="comentario"
                    placeholder="Añade un comentario sobre la actualización"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleActualizarEstado} disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={handleEliminarOrden} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="detalles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                    <dd>{orden.cliente_nombre}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                    <dd>{orden.telefono_cliente || "No disponible"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                    <dd>{orden.correo_cliente || "No disponible"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
                    <dd>{orden.dispositivo}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Modelo</dt>
                    <dd>{orden.modelo}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Problema</dt>
                    <dd>{orden.problema}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Reparación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</dt>
                    <dd>{orden.fecha_ingreso}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Fecha de Entrega Estimada</dt>
                    <dd>{orden.fecha_entrega || "Pendiente"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Costo Estimado</dt>
                    <dd>${parseFloat(orden.costo_estimado || "0").toFixed(2)}</dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Técnico Asignado</dt>
                    <dd>{orden.tecnico_asignado || "Sin asignar"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Estado Actual</dt>
                    <dd>
                      <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                    </dd>
                  </div>
                </dl>
              </div>
              {orden.notas && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Notas</h4>
                  <p className="mt-1">{orden.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de la Orden</CardTitle>
              <CardDescription>Registro de cambios y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {orden.historial?.length ? (
                  orden.historial.map((item: HistorialItem) => (
                    <div key={item.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10">
                          <Badge variant={getVariantForEstado(item.estado)}>
                            {item.estado ? traducirEstado(item.estado).charAt(0) : "?"}
                          </Badge>
                        </div>
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{item.fecha}</p>
                          <Badge variant={getVariantForEstado(item.estado)}>{traducirEstado(item.estado)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                        <p className="text-xs text-muted-foreground">Por: {item.usuario}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay historial disponible.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}