import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function InventoryStatus() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("id, nombre, categoria_id, precio, stock, stock_minimo")
        .limit(5);
      if (error) console.error("Error fetching inventory:", error);
      else {
        const inventoryWithCategories = await Promise.all(
          (data || []).map(async (item) => ({
            ...item,
            categoria: (await supabase.from("categorias_productos").select("nombre").eq("id", item.categoria_id).single()).data?.nombre || "Sin categoría",
            estado: item.stock <= item.stock_minimo ? "Bajo" : "Normal",
          }))
        );
        setInventory(inventoryWithCategories);
      }
      setLoading(false);
    };
    fetchInventory();
  }, []);

  if (loading) return <div className="p-6">Cargando inventario...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estado del Inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotados</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todo
        </Button>
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
                <TableCell className="hidden md:table-cell">{item.categoria}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.stock}
                    {item.estado === "Bajo" && (
                      <Badge variant="destructive" className="ml-2">
                        Stock Bajo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">${item.precio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}