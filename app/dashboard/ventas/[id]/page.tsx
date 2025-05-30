"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Trash, BarChart, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Categoria {
  nombre: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
}

interface Movimiento {
  id: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  referencia: string;
  usuario: string;
}

interface VentaReciente {
  id: string;
  fecha: string;
  cliente: string;
  cantidad: number;
  precio: number;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  cantidad: number;
  stock_minimo: number;
  ubicacion: string;
  proveedor: Proveedor;
  movimientos: Movimiento[];
  ventas_recientes: VentaReciente[];
}

export default function DetalleProductoPage({ params }: { params: { id?: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState<Producto | null>(null);

  useEffect(() => {
    // Verificar que params.id esté definido
    if (!params.id) {
      console.error("ID de producto no proporcionado");
      toast({ title: "Error", description: "ID de producto no válido.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const fetchProducto = async () => {
      try {
        const { data, error } = await supabase
          .from("inventario")
          .select(`
            id,
            nombre,
            descripcion,
            precio,
            precio_compra,
            cantidad,
            stock_minimo,
            ubicacion,
            categoria:categorias_productos!inner(nombre),
            proveedor:proveedores!inner(id, nombre, telefono, correo),
            movimientos:movimientos_inventario(
              id,
              tipo,
              cantidad,
              fecha,
              referencia,
              usuario_id
            ),
            ventas_recientes:productos_venta(
              id,
              venta_id,
              cantidad,
              precio_final,
              ventas(
                id,
                created_at,
                cliente:clientes!inner(nombre)
              )
            )
          `)
          .eq("id", params.id)
          .single();

        if (error) throw error;

        setProducto({
          id: data.id,
          nombre: data.nombre,
          categoria: data.categoria?.[0] || { nombre: "Sin categoría" },
          descripcion: data.descripcion || "",
          precio_compra: data.precio_compra || 0,
          precio_venta: data.precio || 0,
          cantidad: data.cantidad || 0,
          stock_minimo: data.stock_minimo || 0,
          ubicacion: data.ubicacion || "",
          proveedor: data.proveedor?.[0] || { id: "", nombre: "Sin proveedor", telefono: "", correo: "" },
          movimientos: data.movimientos?.map((m: any) => ({
            id: m.id,
            tipo: m.tipo,
            cantidad: m.cantidad,
            fecha: m.fecha,
            referencia: m.referencia || "Sin referencia",
            usuario: m.usuario_id || "Sistema",
          })) || [],
          ventas_recientes: data.ventas_recientes?.map((v: any) => ({
            id: v.venta_id,
            fecha: v.ventas?.[0]?.created_at || "",
            cliente: v.ventas?.[0]?.cliente?.[0]?.nombre || "Desconocido",
            cantidad: v.cantidad,
            precio: v.precio_final || 0,
          })) || [],
        });
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast({ title: "Error", description: `No se pudo cargar el producto: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("inventario").delete().eq("id", params.id);
      if (error) throw error;

      toast({ title: "Producto eliminado", description: "El producto ha sido eliminado correctamente." });
      router.push("/dashboard/inventario");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Cargando producto...</div>;
  if (!producto) return <div className="p-6">Producto no encontrado.</div>;

  const estadoStock = getEstadoStock(producto.cantidad, producto.stock_minimo);
  const estadoVariante = getVariantForStock(estadoStock);

  function getEstadoStock(cantidad: number, stockMinimo: number) {
    if (cantidad === 0) return "agotado";
    if (cantidad <= stockMinimo) return "bajo";
    return "normal";
  }

  function getVariantForStock(estado: "normal" | "bajo" | "agotado"): "default" | "secondary" | "destructive" {
    const variantes: Record<"normal" | "bajo" | "agotado", "default" | "secondary" | "destructive"> = {
      normal: "default",
      bajo: "secondary",
      agotado: "destructive",
    };
    return variantes[estado];
  }

  function traducirEstadoStock(estado: "normal" | "bajo" | "agotado"): string {
    const traducciones: Record<"normal" | "bajo" | "agotado", string> = {
      normal: "En Stock",
      bajo: "Stock Bajo",
      agotado: "Agotado",
    };
    return traducciones[estado];
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inventario">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{producto.nombre}</h2>
          <Badge variant={estadoVariante}>{traducirEstadoStock(estadoStock)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/inventario/${producto.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
        </TabsList>
        <TabsContent value="detalles" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información del Producto</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{producto.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{producto.categoria.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="font-medium">{producto.descripcion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{producto.ubicacion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información de Precios</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Compra</p>
                    <p className="font-medium">${producto.precio_compra.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Venta</p>
                    <p className="font-medium">${producto.precio_venta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                    <p className="font-medium">
                      {(((producto.precio_venta - producto.precio_compra) / (producto.precio_compra || 1)) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información de Stock</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad Actual</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{producto.cantidad} unidades</p>
                      <Badge variant={estadoVariante}>{traducirEstadoStock(estadoStock)}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                    <p className="font-medium">{producto.stock_minimo} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor en Inventario</p>
                    <p className="font-medium">${(producto.cantidad * producto.precio_compra).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información del Proveedor</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{producto.proveedor.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{producto.proveedor.telefono || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p className="font-medium">{producto.proveedor.correo || "No disponible"}</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/proveedores/${producto.proveedor.id}`}>Ver Proveedor</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Registro de entradas y salidas del producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {producto.movimientos.length ? (
                  producto.movimientos.map((movimiento) => (
                    <div key={movimiento.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10">
                          {movimiento.tipo === "entrada" ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{movimiento.fecha}</p>
                          <Badge variant={movimiento.tipo === "entrada" ? "success" : "secondary"}>
                            {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                          </Badge>
                        </div>
                        <p className="text-sm">
                          {movimiento.tipo === "entrada" ? "+" : "-"}{movimiento.cantidad} unidades
                        </p>
                        <p className="text-sm text-muted-foreground">Referencia: {movimiento.referencia}</p>
                        <p className="text-xs text-muted-foreground">Por: {movimiento.usuario}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay movimientos registrados.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventas">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>Historial de ventas de este producto</CardDescription>
            </CardHeader>
            <CardContent>
              {producto.ventas_recientes.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">No hay ventas recientes para este producto.</div>
              ) : (
                <div className="space-y-4">
                  {producto.ventas_recientes.map((venta) => (
                    <div key={venta.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/dashboard/ventas/${venta.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {venta.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">Fecha: {venta.fecha}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{venta.cantidad} unidades</p>
                          <p className="text-sm text-muted-foreground">${venta.precio.toFixed(2)} c/u</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">Cliente: {venta.cliente}</p>
                        <p className="text-sm font-medium mt-1">Total: ${(venta.cantidad * venta.precio).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/inventario/reportes">
                    <BarChart className="mr-2 h-4 w-4" />
                    Ver Reporte Completo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}