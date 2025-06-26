"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Minus, Plus, Search, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface Cliente {
  id: string;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [clienteId, setClienteId] = useState("none");
  const [metodoPago, setMetodoPago] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [empresaId, setEmpresaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Usuario no autenticado");

        const { data: usuario, error: userError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", user.id)
          .single();

        if (userError || !usuario) throw new Error("No se pudo obtener la empresa del usuario");

        setEmpresaId(usuario.empresa_id);

        const { data: clientesData, error: errClientes } = await supabase
          .from("clientes")
          .select("id, nombre")
          .eq("empresa_id", usuario.empresa_id)
          .order("nombre", { ascending: true });

        const { data: productosData, error: errProductos } = await supabase
          .from("productos")
          .select(`
            id,
            nombre,
            precio,
            stock,
            categorias (nombre)
          `)
          .eq("empresa_id", usuario.empresa_id)
          .order("nombre", { ascending: true });

        if (errClientes) throw errClientes;
        if (errProductos) throw errProductos;

        setClientes((clientesData || []).filter(c => c.id && c.nombre));
        setProductos(
          (productosData || []).filter(p => p.id && p.nombre).map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            stock: p.stock,
            categoria: p.categorias?.nombre || "Sin categoría",
          }))
        );
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setTotal(carrito.reduce((sum, item) => sum + item.subtotal, 0));
  }, [carrito]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const agregarProducto = (producto: Producto) => {
    const existeEnCarrito = carrito.find((item) => item.id === producto.id);
    const stockDisponible = producto.stock;

    if (existeEnCarrito) {
      if (existeEnCarrito.cantidad >= stockDisponible) {
        return toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${stockDisponible} unidades de ${producto.nombre}.`,
          variant: "destructive",
        });
      }
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item
        )
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

  const incrementarCantidad = (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) agregarProducto(producto);
  };

  const decrementarCantidad = (id: number) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.precio,
            }
          : item
      )
    );
  };

  const eliminarProducto = (id: number) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const procesarVenta = async () => {
    if (!metodoPago) {
      return toast({
        title: "Método de pago requerido",
        description: "Seleccione un método de pago para continuar",
        variant: "destructive",
      });
    }

    if (carrito.length === 0) {
      return toast({
        title: "Carrito vacío",
        description: "Agregue productos al carrito para continuar",
        variant: "destructive",
      });
    }

    if (!empresaId) {
      return toast({
        title: "Error de empresa",
        description: "No se pudo identificar la empresa",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      // 1. Crear la venta
      const { data: venta, error: errorVenta } = await supabase
        .from("ventas")
        .insert({
          cliente_id: clienteId === "none" ? null : clienteId,
          total,
          metodo_pago: metodoPago,
          empresa_id: empresaId,
          fecha_venta: new Date().toISOString(),
        })
        .select()
        .single();

      if (errorVenta) throw errorVenta;
      if (!venta) throw new Error("No se pudo crear la venta");

      // 2. Agregar items de venta
      const detalleVenta = carrito.map((item) => ({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.subtotal,
      }));

      const { error: errorDetalle } = await supabase
        .from("detalle_venta")
        .insert(detalleVenta);

      if (errorDetalle) throw errorDetalle;

      // 3. Actualizar stock usando RPC
      const actualizacionesStock = carrito.map((item) => {
        return supabase.rpc('decrementar_stock', {
          producto_id: item.id,
          cantidad: item.cantidad
        });
      });

      await Promise.all(actualizacionesStock);

      toast({
        title: "Venta registrada exitosamente",
        description: `La venta #${venta.id} ha sido procesada`,
      });

      router.push("/dashboard/ventas");
    } catch (error: any) {
      console.error("Error al procesar venta:", error);
      toast({
        title: "Error al procesar la venta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <DashboardHeader />

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/ventas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Nueva Venta</h2>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar productos</CardTitle>
            <CardDescription>Filtra y agrega productos al carrito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{producto.stock}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => agregarProducto(producto)}
                            disabled={producto.stock === 0}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Añadir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Carrito de venta</CardTitle>
            <CardDescription>Productos seleccionados</CardDescription>
          </CardHeader>
          <CardContent>
            {carrito.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay productos en el carrito
              </div>
            ) : (
              <div className="space-y-3">
                {carrito.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.precio.toFixed(2)} × {item.cantidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => decrementarCantidad(item.id)}
                        disabled={item.cantidad <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => incrementarCantidad(item.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => eliminarProducto(item.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Cliente no especificado</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="metodo-pago">Método de pago</Label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={procesarVenta}
              disabled={carrito.length === 0 || !metodoPago || loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.427 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                "Completar Venta"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}