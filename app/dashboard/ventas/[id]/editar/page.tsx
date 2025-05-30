"use client";
import React from 'react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Minus, Plus, Search, Trash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Tipos
interface Cliente {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface Venta {
  id: string;
  cliente_id: string | null;
  metodo_pago: string;
  subtotal: number;
  impuesto: number;
  total: number;
  notas: string;
  estado: string;
  productos: ProductoCarrito[];
}

export default function EditarVentaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [notas, setNotas] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Estados para datos de Supabase
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [venta, setVenta] = useState<Venta | null>(null);

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Cargar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from("clientes")
          .select("id, nombre");

        if (clientesError) throw clientesError;
        setClientes(clientesData || []);

        // Cargar productos
        const { data: productosData, error: productosError } = await supabase
          .from("inventario")
          .select("id, nombre, categoria:categorias_productos!inner(nombre), precio, cantidad");

        if (productosError) throw productosError;

        const mappedProductos: Producto[] = productosData.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria?.nombre || "Sin categoría",
          precio: p.precio || 0,
          cantidad: p.cantidad || 0,
        }));
        setProductos(mappedProductos);

        // Cargar la venta específica
        const { data: ventaData, error: ventaError } = await supabase
          .from("ventas")
          .select(`
            id,
            cliente_id,
            metodo_pago,
            subtotal,
            impuesto,
            total,
            notas,
            estado,
            productos_venta (
              id,
              producto_id,
              cantidad,
              precio_final,
              inventario!inner(nombre)
            )
          `)
          .eq("id", params.id)
          .single();

        if (ventaError) throw ventaError;
        if (!ventaData) throw new Error("Venta no encontrada");

        const mappedProductosVenta: ProductoCarrito[] = ventaData.productos_venta.map((pv: any) => ({
          id: pv.producto_id,
          nombre: pv.inventario?.nombre || "Producto desconocido",
          precio: pv.precio_final || 0,
          cantidad: pv.cantidad || 0,
          subtotal: (pv.cantidad || 0) * (pv.precio_final || 0),
        }));

        setVenta({
          id: ventaData.id,
          cliente_id: ventaData.cliente_id || null,
          metodo_pago: ventaData.metodo_pago || "",
          subtotal: ventaData.subtotal || 0,
          impuesto: ventaData.impuesto || 0,
          total: ventaData.total || 0,
          notas: ventaData.notas || "",
          estado: ventaData.estado || "completada",
          productos: mappedProductosVenta,
        });

        setClienteId(ventaData.cliente_id || "anonymous");
        setMetodoPago(ventaData.metodo_pago || "");
        setCarrito(mappedProductosVenta);
        setNotas(ventaData.notas || "");
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de la venta.",
          variant: "destructive",
        });
        router.push("/dashboard/ventas");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Actualizar subtotal, impuesto y total cuando cambia el carrito
  useEffect(() => {
    const nuevoSubtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const nuevoImpuesto = nuevoSubtotal * 0.16; // 16% de impuesto
    const nuevoTotal = nuevoSubtotal + nuevoImpuesto;
    setSubtotal(nuevoSubtotal);
    setImpuesto(nuevoImpuesto);
    setTotal(nuevoTotal);
  }, [carrito]);

  // Agregar producto al carrito
  const agregarProducto = (producto: Producto) => {
    const productoExistente = carrito.find((item) => item.id === producto.id);

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item,
        ),
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ]);
    }
  };

  // Incrementar cantidad de un producto en el carrito
  const incrementarCantidad = (id: string) => {
    const productoExistente = carrito.find((item) => item.id === id);
    const productoInventario = productos.find((p) => p.id === id);

    if (productoExistente && productoInventario) {
      const cantidadOriginal = venta?.productos.find((p) => p.id === id)?.cantidad || 0;
      const cantidadActual = productoExistente.cantidad;
      const stockDisponible = productoInventario.cantidad + cantidadOriginal - (cantidadActual - 1);

      if (cantidadActual >= stockDisponible) {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock de ${productoExistente.nombre}. Disponible: ${stockDisponible} unidades.`,
          variant: "destructive",
        });
        return;
      }
    }

    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio,
            }
          : item,
      ),
    );
  };

  // Decrementar cantidad de un producto en el carrito
  const decrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.precio,
            }
          : item,
      ),
    );
  };

  // Eliminar producto del carrito
  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  // Actualizar la venta
  const actualizarVenta = async () => {
    if (carrito.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío.",
        variant: "destructive",
      });
      return;
    }

    if (!metodoPago) {
      toast({
        title: "Error",
        description: "Selecciona un método de pago.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Actualizar la venta en la tabla `ventas`
      const { error: ventaError } = await supabase
        .from("ventas")
        .update({
          cliente_id: clienteId === "anonymous" ? null : clienteId || null,
          metodo_pago: metodoPago,
          subtotal,
          impuesto,
          total,
          notas,
        })
        .eq("id", params.id);

      if (ventaError) throw ventaError;

      // Calcular diferencias de stock para productos
      const productosOriginales = venta?.productos || [];
      const productosActualizados: { [key: string]: number } = {};

      // Registrar cantidades actuales
      carrito.forEach((item) => {
        productosActualizados[item.id] = item.cantidad;
      });

      // Calcular diferencias y ajustar stock
      const movimientos: { producto_id: string; tipo: string; cantidad: number; referencia: string }[] = [];

      for (const prodOriginal of productosOriginales) {
        const cantidadOriginal = prodOriginal.cantidad;
        const cantidadNueva = productosActualizados[prodOriginal.id] || 0;
        const diferencia = cantidadNueva - cantidadOriginal;

        if (diferencia !== 0) {
          const productoInventario = productos.find((p) => p.id === prodOriginal.id);
          if (productoInventario) {
            const nuevoStock = productoInventario.cantidad - diferencia;
            if (nuevoStock < 0) {
              throw new Error(
                `Stock insuficiente para ${prodOriginal.nombre}. Necesitas ${Math.abs(nuevoStock)} unidades más.`,
              );
            }

            // Actualizar stock
            const { error: stockError } = await supabase
              .from("inventario")
              .update({ cantidad: nuevoStock })
              .eq("id", prodOriginal.id);

            if (stockError) throw stockError;

            // Registrar movimiento
            movimientos.push({
              producto_id: prodOriginal.id,
              tipo: diferencia > 0 ? "salida" : "entrada",
              cantidad: Math.abs(diferencia),
              referencia: `Ajuste por edición de venta ${params.id}`,
            });
          }
        }
      }

      // Verificar productos nuevos (no estaban en la venta original)
      for (const item of carrito) {
        if (!productosOriginales.find((p) => p.id === item.id)) {
          const productoInventario = productos.find((p) => p.id === item.id);
          if (productoInventario) {
            const nuevoStock = productoInventario.cantidad - item.cantidad;
            if (nuevoStock < 0) {
              throw new Error(
                `Stock insuficiente para ${item.nombre}. Necesitas ${Math.abs(nuevoStock)} unidades más.`,
              );
            }

            // Actualizar stock
            const { error: stockError } = await supabase
              .from("inventario")
              .update({ cantidad: nuevoStock })
              .eq("id", item.id);

            if (stockError) throw stockError;

            // Registrar movimiento
            movimientos.push({
              producto_id: item.id,
              tipo: "salida",
              cantidad: item.cantidad,
              referencia: `Ajuste por edición de venta ${params.id}`,
            });
          }
        }
      }

      // Registrar movimientos en `movimientos_inventario`
      if (movimientos.length > 0) {
        const movimientosData = movimientos.map((mov) => ({
          ...mov,
          fecha: new Date().toISOString(),
          usuario_id: "Sistema", // Ajusta según tu lógica de autenticación
        }));

        const { error: movimientosError } = await supabase.from("movimientos_inventario").insert(movimientosData);

        if (movimientosError) throw movimientosError;
      }

      // Eliminar productos_venta existentes
      const { error: deleteError } = await supabase
        .from("productos_venta")
        .delete()
        .eq("venta_id", params.id);

      if (deleteError) throw deleteError;

      // Insertar nuevos productos_venta
      const productosVenta = carrito.map((item) => ({
        venta_id: params.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_final: item.precio,
        descuento: 0,
        descuento_tipo: "monto",
      }));

      const { error: productosError } = await supabase.from("productos_venta").insert(productosVenta);

      if (productosError) throw productosError;

      toast({
        title: "Venta actualizada",
        description: "La venta ha sido actualizada correctamente.",
      });

      // Redireccionar a la vista de detalles
      router.push(`/dashboard/ventas/${params.id}`);
    } catch (error: any) {
      console.error("Error al actualizar la venta:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la venta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6">Cargando datos...</div>;
  }

  if (!venta) {
    return <div className="p-6">Venta no encontrada.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/ventas/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Editar Venta #{params.id}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos en la Venta</CardTitle>
              <CardDescription>Edita los productos incluidos en esta venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carrito.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No hay productos en la venta. Agrega productos para continuar.
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => decrementarCantidad(item.id)}
                            disabled={item.cantidad <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrementar</span>
                          </Button>
                          <div className="flex h-8 w-10 items-center justify-center text-sm">{item.cantidad}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => incrementarCantidad(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Incrementar</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
              <CardDescription>Busca y agrega productos adicionales a la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No se encontraron productos que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{producto.cantidad}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => agregarProducto(producto)}
                            disabled={producto.cantidad === 0}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Agregar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Venta</CardTitle>
              <CardDescription>Información general de la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anonymous">Cliente Anónimo</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago} required>
                    <SelectTrigger id="metodo_pago">
                      <SelectValue placeholder="Selecciona un método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Efectivo", "Tarjeta", "Transferencia"].map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          {metodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas adicionales sobre la venta"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="w-full space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (16%)</span>
                  <span>${impuesto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button variant="outline" className="w-1/2" asChild disabled={loading}>
                  <Link href={`/dashboard/ventas/${params.id}`}>Cancelar</Link>
                </Button>
                <Button
                  className="w-1/2"
                  size="lg"
                  onClick={actualizarVenta}
                  disabled={carrito.length === 0 || !metodoPago || loading}
                >
                  {loading ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}