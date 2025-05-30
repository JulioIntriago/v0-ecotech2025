"use client";

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
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

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

export default function NuevaVentaPage() {
  const router = useRouter();
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para datos de Supabase
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar clientes y productos desde Supabase
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
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes o productos.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Actualizar total cuando cambia el carrito
  useEffect(() => {
    const nuevoTotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(nuevoTotal);
  }, [carrito]);

  // Agregar producto al carrito
  const agregarProducto = (producto: Producto) => {
    const productoExistente = carrito.find((item) => item.id === producto.id);

    if (productoExistente) {
      // Si ya existe, incrementar cantidad (verificar stock disponible)
      const productoInventario = productos.find((p) => p.id === producto.id);
      if (productoInventario && productoExistente.cantidad >= productoInventario.cantidad) {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock de ${producto.nombre}. Disponible: ${productoInventario.cantidad} unidades.`,
          variant: "destructive",
        });
        return;
      }

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
      // Si no existe, agregar nuevo
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

    if (productoExistente && productoInventario && productoExistente.cantidad >= productoInventario.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${productoExistente.nombre}. Disponible: ${productoInventario.cantidad} unidades.`,
        variant: "destructive",
      });
      return;
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

  // Procesar la venta
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "El carrito está vacío. Agrega productos para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!metodoPago) {
      toast({
        title: "Método de pago requerido",
        description: "Selecciona un método de pago para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generar un ID único para la venta
      const ventaId = `VTA-${Date.now()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      // Guardar la venta en la tabla `ventas`
      const { error: ventaError } = await supabase.from("ventas").insert({
        id: ventaId,
        cliente_id: clienteId === "anonymous" ? null : clienteId || null,
        subtotal: total,
        descuento_general: 0, // No se manejan descuentos generales en este formulario
        impuesto: 0, // Asumimos que no hay impuestos por ahora
        total,
        total_ahorrado: 0,
        factura_generada: false,
        numero_venta: ventaId,
        metodo_pago: metodoPago,
        estado: "completada",
      });

      if (ventaError) throw ventaError;

      // Guardar los productos de la venta en la tabla `productos_venta`
      const productosVenta = carrito.map((item) => ({
        venta_id: ventaId,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_final: item.precio,
        descuento: 0, // No se manejan descuentos por producto en este formulario
        descuento_tipo: "monto",
      }));

      const { error: productosError } = await supabase.from("productos_venta").insert(productosVenta);

      if (productosError) throw productosError;

      // Actualizar el stock en la tabla `inventario`
      for (const item of carrito) {
        const producto = productos.find((p) => p.id === item.id);
        if (producto) {
          const nuevoStock = producto.cantidad - item.cantidad;
          const { error: stockError } = await supabase
            .from("inventario")
            .update({ cantidad: nuevoStock })
            .eq("id", item.id);

          if (stockError) throw stockError;
        }
      }

      // Registrar movimiento en `movimientos_inventario` (salida por venta)
      const movimientos = carrito.map((item) => ({
        producto_id: item.id,
        tipo: "salida",
        cantidad: item.cantidad,
        fecha: new Date().toISOString(),
        referencia: `Venta ${ventaId}`,
        usuario_id: "Sistema", // Ajusta según tu lógica de autenticación
      }));

      const { error: movimientosError } = await supabase.from("movimientos_inventario").insert(movimientos);

      if (movimientosError) throw movimientosError;

      toast({
        title: "Venta completada",
        description: "La venta se ha registrado correctamente.",
      });

      // Redireccionar a la lista de ventas
      router.push("/dashboard/ventas");
    } catch (error: any) {
      console.error("Error al procesar la venta:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la venta. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6">Cargando datos...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ventas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Venta</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Productos</CardTitle>
              <CardDescription>Busca y agrega productos al carrito</CardDescription>
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
              <CardTitle>Carrito de Compra</CardTitle>
              <CardDescription>Productos seleccionados para la venta</CardDescription>
            </CardHeader>
            <CardContent>
              {carrito.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  El carrito está vacío. Agrega productos para continuar.
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
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
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente (Opcional)</Label>
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
              </div>
              <div className="flex w-full items-center justify-between border-t pt-4">
                <div className="text-lg font-semibold">Total:</div>
                <div className="text-xl font-bold">${total.toFixed(2)}</div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={procesarVenta}
                disabled={carrito.length === 0 || !metodoPago || loading}
              >
                {loading ? "Procesando..." : "Completar Venta"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}