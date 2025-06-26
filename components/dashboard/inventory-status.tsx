"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface InventoryStatusProps {
  empresaId: number;
}

interface InventoryItem {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoria?: { nombre: string };
}

export function InventoryStatus({ empresaId }: InventoryStatusProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!empresaId) {
        setError("ID de empresa no proporcionado.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, precio, stock, stock_minimo, categorias(nombre)")
        .eq("empresa_id", empresaId)
        .limit(5);

      if (error) {
        console.error("Error al cargar el inventario:", error);
        setError("No se pudo cargar el inventario. Por favor, intenta de nuevo.");
        setLoading(false);
        return;
      }

      // Filtrar productos con stock bajo en el cliente
      const lowStockItems = (data || []).filter(
        (item) => item.stock <= item.stock_minimo
      );

      setInventory(lowStockItems);
      setLoading(false);
    };

    fetchInventory();
  }, [empresaId]);

  if (loading) return <div className="p-6">Cargando inventario...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estado del Inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotado</CardDescription>
        </div>
        <Button variant="outline" size="sm">Ver todo</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.categoria?.nombre || "Sin categoría"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.stock}
                    <Badge variant="destructive" className="ml-2">
                      Stock Bajo
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  ${item.precio.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Todo el inventario está en niveles normales
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}