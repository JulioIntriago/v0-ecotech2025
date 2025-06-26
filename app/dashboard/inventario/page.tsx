"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}
 from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/app/context/empresa-context";
import { toast } from "@/components/ui/use-toast";

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoria_id: number;
  categoria: Categoria | null;
  precio_compra: number;
}

export default function InventarioPage() {
  const { empresaId } = useEmpresa();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      toast({ title: "Advertencia", description: "ID de empresa no disponible. Asegúrate de iniciar sesión en una empresa.", variant: "default" });
      return;
    }

    const fetchProductos = async () => {
      try {
        // CORREGIDO: Usar el nombre exacto de la clave foránea confirmada: productos_categoria_id_fkey
        // Asegúrate de que no haya caracteres adicionales o comentarios.
        const { data, error } = await supabase
          .from("productos")
          .select(`
            id,
            nombre,
            precio,
            stock,
            stock_minimo,
            categoria_id,
            precio_compra,
            categoria:categorias!productos_categoria_id_fkey(
              id,
              nombre
            )
          `)
          .eq("empresa_id", empresaId);

        if (error) {
          console.error("Supabase Error fetching products:", error);
          toast({ title: "Error", description: `No se pudo cargar el inventario: ${error.message}`, variant: "destructive" });
          throw error;
        }

        setProductos(data);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast({ title: "Error", description: `No se pudo cargar el inventario: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [empresaId]);

  const categorias = [
    "Todas",
    ...new Set(productos.map((p) => p.categoria?.nombre ?? "Sin categoría")),
  ];

  function getEstadoStock(stock: number, stockMinimo: number) {
    if (stock === 0) return "agotado";
    if (stock <= stockMinimo) return "bajo";
    return "normal";
  }

  function getVariantForStock(estado: "normal" | "bajo" | "agotado") {
    const variantes = {
      normal: "default",
      bajo: "secondary",
      agotado: "destructive",
    } as const;
    return variantes[estado];
  }

  function traducirEstadoStock(estado: "normal" | "bajo" | "agotado") {
    const traducciones = {
      normal: "En Stock",
      bajo: "Stock Bajo",
      agotado: "Agotado",
    };
    return traducciones[estado];
  }

  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch =
      producto.id.toString().includes(searchQuery.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase());

    const categoriaNombre = producto.categoria?.nombre ?? "Sin categoría";
    const matchesCategoria =
      filtroCategoria === "Todas" || categoriaNombre === filtroCategoria;

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
            placeholder="Buscar por nombre o ID..."
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
          <CardDescription>
            Gestiona el inventario de productos y repuestos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No se encontraron productos que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((producto) => {
                  const estadoStock = getEstadoStock(
                    producto.stock,
                    producto.stock_minimo || 0
                  );
                  return (
                    <TableRow key={producto.id}>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {producto.categoria?.nombre ?? "Sin categoría"}
                      </TableCell>
                      <TableCell className="text-right">
                        ${producto.precio.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{producto.stock}</span>
                          <Badge variant={getVariantForStock(estadoStock)}>
                            {traducirEstadoStock(estadoStock)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/inventario/${producto.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Detalles
                            </Link>
                          </Button>
                        </div>
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
