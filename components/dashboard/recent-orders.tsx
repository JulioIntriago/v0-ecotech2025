"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("ordenes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          // Obtener datos de equipos para cada orden
          const ordersWithEquipment = await Promise.all(
            (data || []).map(async (order) => {
              const { data: equipmentData, error: equipmentError } = await supabase
                .from("equipos")
                .select("marca, modelo")
                .eq("id", order.equipo_id)
                .single();

              if (equipmentError) {
                console.error("Error fetching equipment for order", order.id, ":", equipmentError);
              }

              return {
                ...order,
                equipo_marca: equipmentData?.marca || "Desconocido",
                equipo_modelo: equipmentData?.modelo || "Desconocido",
              };
            })
          );

          setOrders(ordersWithEquipment);
        }
      } catch (error) {
        console.error("General error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Cargando órdenes...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>Últimas 5 órdenes de reparación registradas</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.numero_orden || order.id}</TableCell>
                <TableCell>{order.cliente_nombre}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {order.equipo_marca} {order.equipo_modelo}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.estado === "Finalizado" || order.estado === "Entregado"
                        ? "success"
                        : order.estado === "En proceso"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {order.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar orden</DropdownMenuItem>
                      <DropdownMenuItem>Actualizar estado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}