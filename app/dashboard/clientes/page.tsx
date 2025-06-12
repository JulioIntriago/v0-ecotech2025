"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { supabase } from "@/lib/supabase";

interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  ultima_visita: string;
  ordenes_activas: number;
  total_gastado: number;
}

export default function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("clientes")
          .select("id, nombre, cedula, telefono, email");

        if (clientesError) throw clientesError;

        const clientesConDatos = await Promise.all(
          (clientesData || []).map(async (cliente) => {
            const { data: ordenesData, error: ordenesError } = await supabase
              .from("ordenes")
              .select("id")
              .eq("cliente_id", cliente.id)
              .in("estado", ["pendiente", "en_proceso"]);

            if (ordenesError) throw ordenesError;

            const { data: ventasData, error: ventasError } = await supabase
              .from("ventas")
              .select("total")
              .eq("cliente_id", cliente.id);

            if (ventasError) throw ventasError;

            const { data: ultimaOrden, error: ultimaOrdenError } = await supabase
              .from("ordenes")
              .select("created_at")
              .eq("cliente_id", cliente.id)
              .order("created_at", { ascending: false })
              .limit(1);

            const { data: ultimaCompra, error: ultimaCompraError } = await supabase
              .from("ventas")
              .select("created_at")
              .eq("cliente_id", cliente.id)
              .order("created_at", { ascending: false })
              .limit(1);

            if (ultimaOrdenError || ultimaCompraError) throw ultimaOrdenError || ultimaCompraError;

            const ultimaVisita =
              ultimaOrden?.[0]?.created_at || ultimaCompra?.[0]?.created_at || "No disponible";

            return {
              ...cliente,
              ordenes_activas: ordenesData?.length || 0,
              total_gastado: ventasData?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0,
              ultima_visita: ultimaVisita,
            };
          })
        );

        setClientes(clientesConDatos);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.telefono.includes(searchQuery) ||
      cliente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-6">Cargando clientes...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
        <Button asChild>
          <Link href="/dashboard/clientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, cédula, teléfono, email o ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Clientes</CardTitle>
          <CardDescription>Gestiona la información de tus clientes y su historial</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Cédula</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden lg:table-cell">Última Visita</TableHead>
                <TableHead className="text-center">Órdenes Activas</TableHead>
                <TableHead className="hidden md:table-cell text-right">Total Gastado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron clientes que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-muted-foreground">{cliente.id}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.cedula}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {cliente.telefono}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {cliente.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{cliente.ultima_visita}</TableCell>
                    <TableCell className="text-center">
                      {cliente.ordenes_activas > 0 ? (
                        <Badge variant="default">{cliente.ordenes_activas}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      ${cliente.total_gastado.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/clientes/${cliente.id}`}>Ver detalles</Link>
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