"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Trash, Printer, Download, ChevronDown, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface Empresa {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio?: number;
}

interface ProductoVenta {
  id: number;
  producto_id: number;
  producto?: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Venta {
  id: string;
  fecha_venta: string;
  cliente?: Cliente;
  empresa?: Empresa;
  total: number;
  metodo_pago: string;
  estado: string;
  usuario: string;
  notas?: string;
  descuento?: number;
  created_at: string;
  updated_at: string;
  productos: ProductoVenta[];
}

export default function DetalleVentaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de venta no proporcionado");
      setLoading(false);
      return;
    }

    const fetchVenta = async () => {
      setLoading(true);
      try {
        // Consulta principal de la venta con todas las relaciones
        const { data: ventaData, error: ventaError } = await supabase
          .from('ventas')
          .select(`
            id,
            fecha_venta,
            total,
            metodo_pago,
            estado,
            usuario,
            notas,
            descuento,
            created_at,
            updated_at,
            cliente:clientes(id, nombre, email, telefono),
            empresa:empresas(id, nombre),
            detalle_venta(
              id,
              producto_id,
              cantidad,
              precio_unitario,
              subtotal,
              productos:productos(id, nombre, precio)
            )
          `)
          .eq('id', id)
          .single();

        if (ventaError) throw ventaError;
        if (!ventaData) throw new Error("Venta no encontrada");

        // Transformar los datos a la estructura de interfaz
        const ventaTransformada: Venta = {
          id: ventaData.id,
          fecha_venta: ventaData.fecha_venta,
          cliente: ventaData.cliente || undefined,
          empresa: ventaData.empresa || undefined,
          total: ventaData.total || 0,
          metodo_pago: ventaData.metodo_pago || 'No especificado',
          estado: ventaData.estado || 'pendiente',
          usuario: ventaData.usuario || 'Desconocido',
          notas: ventaData.notas,
          descuento: ventaData.descuento,
          created_at: ventaData.created_at,
          updated_at: ventaData.updated_at,
          productos: (ventaData.detalle_venta || []).map((item: any) => ({
            id: item.id,
            producto_id: item.producto_id,
            producto: item.productos ? {
              id: item.productos.id,
              nombre: item.productos.nombre,
              precio: item.productos.precio
            } : undefined,
            cantidad: item.cantidad || 0,
            precio_unitario: item.precio_unitario || 0,
            subtotal: item.subtotal || 0
          }))
        };

        setVenta(ventaTransformada);
      } catch (err: any) {
        console.error('Error al cargar venta:', err);
        setError(err.message || 'Error al cargar los datos de la venta');
        toast({
          title: "Error",
          description: err.message || "No se pudo cargar la venta",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVenta();
  }, [id]);

  const handleAnularVenta = async () => {
    if (!venta) return;

    try {
      const { error } = await supabase
        .from('ventas')
        .update({ 
          estado: 'anulada',
          updated_at: new Date().toISOString()
        })
        .eq('id', venta.id);

      if (error) throw error;

      toast({
        title: "Venta anulada",
        description: "La venta ha sido marcada como anulada",
      });

      // Actualizar los datos localmente
      setVenta({ 
        ...venta, 
        estado: 'anulada',
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo anular la venta",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Exportando a PDF",
      description: "La exportación se está preparando...",
    });
    // Implementar lógica real de exportación aquí
  };

  const reimprimirRecibo = () => {
    toast({
      title: "Reimprimiendo recibo",
      description: "Preparando recibo para impresión...",
    });
    // Implementar lógica real de impresión aquí
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>Cargando detalles de la venta...</p>
        </div>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p>{error || "No se pudo cargar la venta"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/ventas')}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  const fechaFormateada = format(new Date(venta.fecha_venta), 'PPPpp', { locale: es });
  const fechaCreacion = format(new Date(venta.created_at), 'PPPpp', { locale: es });
  const fechaActualizacion = format(new Date(venta.updated_at), 'PPPpp', { locale: es });

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />

      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={reimprimirRecibo}>
            <Printer className="mr-2 h-4 w-4" />
            Reimprimir
          </Button>

          <Button variant="outline" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>

          {venta.estado !== 'anulada' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Anular
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de anular esta venta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La venta será marcada como anulada en el sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAnularVenta}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Información de la venta */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Venta #{venta.id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  <div>Fecha: {fechaFormateada}</div>
                  <div>Creada: {fechaCreacion}</div>
                  {venta.updated_at !== venta.created_at && (
                    <div>Actualizada: {fechaActualizacion}</div>
                  )}
                </CardDescription>
              </div>
              <Badge
                variant={
                  venta.estado === 'completada' 
                    ? 'default' 
                    : venta.estado === 'anulada' 
                      ? 'destructive' 
                      : 'secondary'
                }
              >
                {venta.estado.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Cliente</h3>
                  <p>{venta.cliente?.nombre || 'No especificado'}</p>
                  {venta.cliente?.email && <p className="text-sm text-muted-foreground">{venta.cliente.email}</p>}
                  {venta.cliente?.telefono && <p className="text-sm text-muted-foreground">{venta.cliente.telefono}</p>}
                </div>

                {venta.empresa && (
                  <div>
                    <h3 className="font-medium">Empresa</h3>
                    <p>{venta.empresa.nombre}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium">Método de pago</h3>
                <p>{venta.metodo_pago}</p>
              </div>

              {venta.notas && (
                <div>
                  <h3 className="font-medium">Notas</h3>
                  <p className="text-sm text-muted-foreground">{venta.notas}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venta.productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          {producto.producto?.nombre || 'Producto desconocido'}
                          {producto.producto?.precio && (
                            <div className="text-sm text-muted-foreground">
                              Precio normal: ${producto.producto.precio.toFixed(2)}
                              {producto.precio_unitario !== producto.producto.precio && (
                                <span className="ml-2 text-red-500">
                                  (Descuento aplicado)
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{producto.cantidad}</TableCell>
                        <TableCell className="text-right">${producto.precio_unitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${producto.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de pago */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${(venta.productos.reduce((sum, p) => sum + p.subtotal, 0)).toFixed(2)}</span>
              </div>

              {venta.descuento && venta.descuento > 0 && (
                <div className="flex justify-between text-red-500">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span>-${venta.descuento.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${venta.total.toFixed(2)}</span>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-2">Atendido por</h3>
                <p>{venta.usuario}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}