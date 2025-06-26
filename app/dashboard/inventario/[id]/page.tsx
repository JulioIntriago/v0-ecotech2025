"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEmpresa } from "@/app/context/empresa-context";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Info,
  Database,
  DollarSign,
  Activity,
} from "lucide-react";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductoDetalle {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_compra: number;
  stock: number;
  stock_minimo: number;
  unidad_medida: string | null;
  activo: boolean;
  categoria_id: number | null;
  categorias: { nombre: string } | null;
  empresa_id: number;
  created_at: string;
  updated_at: string;
}

export default function DetalleProductoPage({ params }: { params: { id: string } }) {
  const { empresaId } = useEmpresa();
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !params.id) {
      toast({
        title: "Error",
        description: "Faltan parámetros necesarios",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const fetchProducto = async () => {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select(`
            id,
            nombre,
            descripcion,
            precio,
            precio_compra,
            stock,
            stock_minimo,
            unidad_medida,
            activo,
            categoria_id,
            categorias:categoria_id(id, nombre),
            empresa_id,
            created_at,
            updated_at
          `)
          .eq("id", params.id)
          .eq("empresa_id", empresaId)
          .single();

        if (error) throw error;
        setProducto(data);
      } catch (error: any) {
        console.error("Error cargando producto:", error.message);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [empresaId, params.id]);

  const getEstadoStock = () => {
    if (!producto) return "normal";
    if (producto.stock === 0) return "agotado";
    if (producto.stock <= producto.stock_minimo) return "bajo";
    return "normal";
  };

  const getVariantForStock = (estado: string) =>
    ({
      normal: "default",
      bajo: "warning",
      agotado: "destructive",
    }[estado] || "default");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Producto no encontrado</CardTitle>
            <CardDescription>
              El producto que buscas no existe o no tienes acceso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/inventario">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inventario
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estadoStock = getEstadoStock();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            {producto.nombre}
          </h2>
          <p className="text-muted-foreground mt-1">ID: {producto.id}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/inventario">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/inventario/${producto.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Descripción
                </TableCell>
                <TableCell>{producto.descripcion || "Sin descripción"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Precio de Venta
                </TableCell>
                <TableCell>${producto.precio.toFixed(2)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Precio de Compra
                </TableCell>
                <TableCell>${producto.precio_compra.toFixed(2)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Stock Actual
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {producto.stock} {producto.unidad_medida || "unidades"}
                  <Badge variant={getVariantForStock(estadoStock)}>
                    {estadoStock === "normal"
                      ? "En stock"
                      : estadoStock === "bajo"
                      ? "Stock bajo"
                      : "Agotado"}
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Stock Mínimo
                </TableCell>
                <TableCell>
                  {producto.stock_minimo} {producto.unidad_medida || "unidades"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Categoría
                </TableCell>
                <TableCell>{producto.categorias?.nombre || "Sin categoría"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Unidad de Medida
                </TableCell>
                <TableCell>{producto.unidad_medida || "No especificada"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Estado
                </TableCell>
                <TableCell>
                  <Badge variant={producto.activo ? "default" : "secondary"}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Creado
                </TableCell>
                <TableCell>{format(new Date(producto.created_at), "PPP", { locale: es })}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Actualizado
                </TableCell>
                <TableCell>{format(new Date(producto.updated_at), "PPP", { locale: es })}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
