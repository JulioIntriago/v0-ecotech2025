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

// Tipos para TypeScript
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

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const { data: clientesData, error: errClientes } = await supabase
          .from("clientes")
          .select("id, nombre");
        if (errClientes) throw errClientes;
        setClientes(clientesData || []);

        const { data: productosData, error: errProductos } = await supabase
          .from("productos")
.select(`
  id,
  nombre,
  precio,
  stock,
  categorias (
    nombre
  )
`)
          .order("nombre", { ascending: true });
        if (errProductos) throw errProductos;

        const mapped: Producto[] = (productosData || []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.stock,
          categoria: p.categorias?.nombre || "Sin categoría",
        }));
        setProductos(mapped);
      } catch (err: any) {
        console.error("Error fetching:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => { // recalcula total cart
    setTotal(carrito.reduce((sum, i) => sum + i.subtotal, 0));
  }, [carrito]);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function agregarProducto(p: Producto) {
    const exist = carrito.find(i => i.id === p.id);
    const max = p.cantidad;
    if (exist) {
      if (exist.cantidad >= max) {
        return toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${max} unidades de ${p.nombre}.`,
          variant: "destructive",
        });
      }
      setCarrito(carrito.map(i =>
        i.id === p.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio }
          : i
      ));
    } else {
      setCarrito([...carrito, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, subtotal: p.precio }]);
    }
  }

  function incrementar(id: string) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    agregarProducto(prod);
  }
  function decrementar(id: string) {
    setCarrito(carrito.map(i =>
      i.id === id && i.cantidad > 1
        ? { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precio }
        : i
    ));
  }
  function eliminar(id: string) {
    setCarrito(carrito.filter(i => i.id !== id));
  }

  async function procesarVenta() {
    if (!metodoPago) return toast({ title: "Pago requerido", description: "...", variant: "destructive" });
    if (!carrito.length) return toast({ title: "Carrito vacío", variant: "destructive" });

    setLoading(true);
    const ventaId = `VTA-${Date.now()}`;
    try {
      let { error: errVenta } = await supabase.from("ventas").insert({
        id: ventaId,
        cliente_id: clienteId || null,
        total,
        metodo_pago: metodoPago,
      });
      if (errVenta) throw errVenta;

      const detalle = carrito.map(i => ({
        venta_id: ventaId,
        producto_id: i.id,
        cantidad: i.cantidad,
        precio_unitario: i.precio,
        subtotal: i.subtotal,
      }));
      let { error: errDet } = await supabase.from("detalle_venta").insert(detalle);
      if (errDet) throw errDet;

      await Promise.all(carrito.map(i =>
        supabase.from("productos").update({ stock: productos.find(p => p.id === i.id)!.cantidad - i.cantidad }).eq("id", i.id)
      ));

      await supabase.from("inventario_movimientos").insert(carrito.map(i => ({
        producto_id: i.id,
        tipo: "salida",
        cantidad: i.cantidad,
        motivo: `Venta ${ventaId}`,
      })));

      toast({ title: "Venta registrada" });
      router.push("/dashboard/ventas");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 flex flex-col gap-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon"><Link href="/dashboard/ventas"><ArrowLeft/></Link></Button>
        <h2 className="text-2xl font-bold">Nueva Venta</h2>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar productos</CardTitle>
            <CardDescription>Filtra y agrega al carrito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2" />
              <Input placeholder="Buscar..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{p.categoria}</TableCell>
                    <TableCell className="text-right">${p.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{p.cantidad}</TableCell>
                    <TableCell className="text-right">
                      <Button disabled={p.cantidad === 0} size="sm" onClick={() => agregarProducto(p)}>
                        <Plus className="mr-1" />Añadir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carrito</CardTitle>
            <CardDescription>Revisa y completa la venta</CardDescription>
          </CardHeader>
          <CardContent>
            {!carrito.length
              ? <div className="text-center py-4">Carrito vacío</div>
              : carrito.map(i => (
                <div key={i.id} className="flex justify-between items-center border p-2">
                  <div>
                    <strong>{i.nombre}</strong> <br/>
                    ${i.precio.toFixed(2)} x {i.cantidad}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" onClick={() => decrementar(i.id)} disabled={i.cantidad <= 1}><Minus /></Button>
                    <Button size="icon" onClick={() => incrementar(i.id)}><Plus /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => eliminar(i.id)}><Trash/></Button>
                  </div>
                </div>
              ))
            }
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Label>Método de pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger><SelectValue placeholder="Elige"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button className="w-full" size="lg" onClick={procesarVenta} disabled={!carrito.length || !metodoPago || loading}>
              {loading ? "Procesando..." : "Completar Venta"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
