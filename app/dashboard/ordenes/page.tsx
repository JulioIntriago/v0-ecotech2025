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
import { supabase } from "@/lib/supabase";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "@/components/ui/use-toast";

function traducirEstado(estado: string) {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
  };
  return traducciones[estado] || estado;
}

function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  };
  return variantes[estado] || "default";
}

export default function OrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Obtener el usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Usuario no autenticado");
        }

        // Obtener la empresa_id del usuario
        const { data: usuario, error: userError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", user.id)
          .single();

        if (userError || !usuario) {
          throw new Error("No se pudo obtener la empresa del usuario");
        }

        const empresaId = usuario.empresa_id;

        // Consultar órdenes con uniones a clientes y empleados
        const { data, error } = await supabase
          .from("ordenes")
          .select(`
            *,
            clientes(nombre),
            empleados:tecnico_asignado(nombre)
          `)
          .eq("empresa_id", empresaId)
          .order("fecha_ingreso", { ascending: false });

        if (error) {
          console.error("Supabase error details:", error);
          throw new Error(`Error al obtener órdenes: ${error.message}`);
        }

        const formattedData = data.map((orden) => ({
          ...orden,
          cliente_nombre: orden.clientes?.nombre || "Sin cliente",
          tecnico_asignado: orden.empleados?.nombre || "Sin asignar",
        }));
        setOrders(formattedData || []);
      } catch (error: any) {
        console.error("Error general al obtener órdenes:", error);
        toast({ title: "Error", description: error.message || "No se pudieron cargar las órdenes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const ordenesFiltradas = orders.filter((orden) => {
    const matchesSearch =
      orden.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orden.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orden.dispositivo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado = filtroEstado === "todos" || orden.estado === filtroEstado;

    return matchesSearch && matchesEstado;
  });

  if (loading) return <div className="p-6">Cargando órdenes...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
        <Button asChild>
          <Link href="/dashboard/ordenes/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, cliente o dispositivo..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Órdenes</CardTitle>
          <CardDescription>Gestiona las órdenes de reparación de dispositivos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
                <TableHead className="hidden lg:table-cell">Problema</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha Ingreso</TableHead>
                <TableHead className="hidden lg:table-cell">Técnico</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No se encontraron órdenes que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                ordenesFiltradas.map((orden) => (
                  <TableRow key={orden.id}>
                    <TableCell className="font-medium">{orden.id}</TableCell>
                    <TableCell>{orden.cliente_nombre}</TableCell>
                    <TableCell className="hidden md:table-cell">{orden.dispositivo}</TableCell>
                    <TableCell className="hidden lg:table-cell">{orden.problema_reportado}</TableCell>
                    <TableCell>
                      <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(orden.fecha_ingreso).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{orden.tecnico_asignado}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/ordenes/${orden.id}`}>Ver detalles</Link>
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
  );
}