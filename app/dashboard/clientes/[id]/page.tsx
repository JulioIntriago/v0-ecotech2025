"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  notas: string;
  fecha_registro: string;
  ordenes: any[];
  compras: any[];
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

export default function DetalleClientePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", params.id)
          .single();

        if (clienteError) throw clienteError;

        const { data: ordenesData, error: ordenesError } = await supabase
          .from("ordenes")
          .select("id, dispositivo, problema, estado, fecha_ingreso, costo_estimado")
          .eq("cliente_id", params.id);

        if (ordenesError) throw ordenesError;

        const { data: comprasData, error: comprasError } = await supabase
          .from("ventas")
          .select("id, fecha, total, metodo_pago, productos")
          .eq("cliente_id", params.id);

        if (comprasError) throw comprasError;

        setCliente({
          ...clienteData,
          ordenes: ordenesData || [],
          compras: comprasData || [],
        });
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({ title: "Error", description: "No se pudo cargar el cliente.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [params.id]);

  const handleEliminarCliente = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      setLoading(true);
      try {
        const { error } = await supabase.from("clientes").delete().eq("id", params.id);
        if (error) throw error;
        router.push("/dashboard/clientes");
        toast({ title: "Éxito", description: "Cliente eliminado correctamente." });
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        toast({ title: "Error", description: "No se pudo eliminar el cliente.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="p-6">Cargando cliente...</div>;
  if (!cliente) return <div className="p-6">Cliente no encontrado.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{cliente.nombre}</h2>
          <span className="text-sm text-muted-foreground">{cliente.id}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clientes/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEliminarCliente} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="informacion">
        <TabsList>
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
        </TabsList>
        <TabsContent value="informacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Cédula</dt>
                  <dd>{cliente.cedula}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.telefono}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
                  <dd className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.correo || "No disponible"}</span>
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.direccion || "No disponible"}</span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Fecha de Registro</dt>
                  <dd>{cliente.fecha_registro}</dd>
                </div>
                {cliente.notas && (
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Notas</dt>
                    <dd>{cliente.notas}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Órdenes Totales</dt>
                  <dd className="text-2xl font-bold">{cliente.ordenes.length}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Compras Totales</dt>
                  <dd className="text-2xl font-bold">{cliente.compras.length}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Total Gastado</dt>
                  <dd className="text-2xl font-bold">
                    ${cliente.compras.reduce((sum, compra) => sum + (compra.total || 0), 0).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordenes">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Órdenes</CardTitle>
              <CardDescription>Órdenes de reparación del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead className="hidden md:table-cell">Problema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cliente.ordenes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Este cliente no tiene órdenes registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cliente.ordenes.map((orden) => (
                      <TableRow key={orden.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/ordenes/${orden.id}`} className="text-primary hover:underline">
                            {orden.id}
                          </Link>
                        </TableCell>
                        <TableCell>{orden.dispositivo}</TableCell>
                        <TableCell className="hidden md:table-cell">{orden.problema}</TableCell>
                        <TableCell>
                          <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{orden.fecha_ingreso}</TableCell>
                        <TableCell className="text-right">${(orden.costo_estimado || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compras">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>Compras realizadas por el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cliente.compras.length === 0 ? (
                  <div className="text-center text-muted-foreground">Este cliente no tiene compras registradas.</div>
                ) : (
                  cliente.compras.map((compra) => (
                    <div key={compra.id} className="rounded-lg border">
                      <div className="flex items-center justify-between border-b p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/ventas/${compra.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {compra.id}
                            </Link>
                            <span className="text-sm text-muted-foreground">{compra.fecha}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Método de pago: {compra.metodo_pago}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${(compra.total || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(compra.productos || []).map((producto: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell className="text-center">{producto.cantidad}</TableCell>
                                <TableCell className="text-right">${(producto.precio || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}