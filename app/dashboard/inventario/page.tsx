"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { supabase } from "@/lib/supabase";

interface Categoria {
  nombre: string;
}

interface Proveedor {
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precio_compra: number;
  cantidad: number;
  stock_minimo: number;
  ubicacion: string;
  categoria: Categoria;
  proveedor: Proveedor;
}

export default function InventarioPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase
          .from("inventario")
          .select(`
            id,
            nombre,
            precio,
            precio_compra,
            cantidad,
            stock_minimo,
            ubicacion,
            categoria:categorias_productos!inner(nombre),
            proveedor:proveedores!inner(nombre)
          `);

        if (error) throw error;

        // Asegurarse de que categoria y proveedor sean objetos únicos
        const processedData = data.map((item) => ({
          ...item,
          categoria: item.categoria?.[0] || { nombre: "Sin categoría" },
          proveedor: item.proveedor?.[0] || { nombre: "Sin proveedor" },
        }));
        setProductos(processedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const categorias = ["Todas", ...new Set(productos.map((p) => p.categoria.nombre))];

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

  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch =
      producto.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (producto.proveedor?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategoria = filtroCategoria === "Todas" || producto.categoria.nombre === filtroCategoria;

    return matchesSearch && matchesCategoria;
  });

  if (loading) return <div className="p-6">Cargando inventario...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
        <Button asChild>
          <Link href="/dashboard/inventario/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, ID o proveedor..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
          <CardDescription>Gestiona el inventario de productos y repuestos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron productos que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((producto) => {
                  const estadoStock = getEstadoStock(producto.cantidad, producto.stock_minimo || 0);
                  return (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.id}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">{producto.categoria.nombre}</TableCell>
                      <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{producto.cantidad}</span>
                          <Badge variant={getVariantForStock(estadoStock)}>{traducirEstadoStock(estadoStock)}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{producto.proveedor?.nombre || "Sin proveedor"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/inventario/${producto.id}`}>Ver detalles</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}