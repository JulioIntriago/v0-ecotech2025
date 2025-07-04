"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";

interface RecentOrdersProps {
  dateRange?: DateRange;
  empresaId: number; // Aseguramos que empresaId esté en las props
}

interface Order {
  id: number;
  numero_orden: string;
  cliente_id: number;
  equipo_id: number;
  estado: string;
  created_at: string;
  equipo_marca?: string;
  equipo_modelo?: string;
  cliente_nombre?: string;
}

export function RecentOrders({ dateRange, empresaId }: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from("ordenes_trabajo") // Ajustamos el nombre de la tabla a "ordenes_trabajo"
          .select("*")
          .eq("empresa_id", empresaId) // Filtramos por empresa_id
          .order("created_at", { ascending: false })
          .limit(5);

        // Aplicar filtro de fechas si existe
        if (dateRange?.from && dateRange?.to) {
          query = query
            .gte("created_at", dateRange.from.toISOString())
            .lte("created_at", dateRange.to.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          // Obtener datos de equipos y clientes para cada orden
          const ordersWithDetails = await Promise.all(
            (data || []).map(async (order: Order) => {
              const { data: equipmentData, error: equipmentError } = await supabase
                .from("equipos")
                .select("marca, modelo")
                .eq("id", order.equipo_id)
                .eq("empresa_id", empresaId) // Filtramos equipos por empresa_id
                .single();

              const { data: clientData, error: clientError } = await supabase
                .from("clientes")
                .select("nombre")
                .eq("id", order.cliente_id)
                .eq("empresa_id", empresaId) // Filtramos clientes por empresa_id
                .single();

              if (equipmentError) console.error("Error fetching equipment for order", order.id, ":", equipmentError);
              if (clientError) console.error("Error fetching client for order", order.id, ":", clientError);

              return {
                ...order,
                equipo_marca: equipmentData?.marca || "Desconocido",
                equipo_modelo: equipmentData?.modelo || "Desconocido",
                cliente_nombre: clientData?.nombre || "Desconocido",
              };
            })
          );

          setOrders(ordersWithDetails);
        }
      } catch (error) {
        console.error("General error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange, empresaId]); // Añadimos empresaId como dependencia

  if (loading) return <div className="p-6">Cargando órdenes...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>Últimas 5 órdenes de reparación registradas</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/ordenes">Ver todas</a>
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
                      <DropdownMenuItem asChild>
                        <a href={`/dashboard/ordenes/${order.id}`}>Ver detalles</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/dashboard/ordenes/${order.id}/editar`}>Editar orden</a>
                      </DropdownMenuItem>
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