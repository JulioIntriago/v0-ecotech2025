// app/dashboard/empleados/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

type Empleado = {
  id: string;
  nombre: string;
  rol: string;
  telefono: string;
  email: string;
  fecha_contratacion: string;
};

export default function EmpleadosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmpleados() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("Usuario no autenticado");
        }

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", userData.user.id)
          .single();

        if (usuarioError || !usuario) {
          throw new Error("No se encontró el usuario en la tabla usuarios");
        }

        const empresaId = usuario.empresa_id;

        const { data, error } = await supabase
          .from("empleados_con_empresa")
          .select("id, nombre, rol, telefono, email, fecha_contratacion")
          .eq("empresa_id", empresaId);

        if (error) {
          throw new Error(`Error al obtener empleados: ${error.message}`);
        }

        setEmpleados(data || []);
      } catch (err: any) {
        console.error("Error en fetchEmpleados:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchEmpleados();
  }, []);

  const empleadosFiltrados = empleados.filter(emp =>
    [emp.nombre, emp.rol, emp.telefono, emp.email, emp.id].some(f =>
      f?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <DashboardHeader />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Empleados</h2>
        <Button asChild>
          <Link href="/dashboard/empleados/nuevo">
            <Plus className="mr-2" /> Nuevo Empleado
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Empleados</CardTitle>
          <CardDescription>
            {loading
              ? "Cargando..."
              : error
              ? "Error al cargar empleados"
              : `${empleadosFiltrados.length} empleados encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre / ID</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleadosFiltrados.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="font-medium">{emp.nombre}</div>
                      <div className="text-sm text-gray-500">{emp.id}</div>
                    </TableCell>
                    <TableCell>{emp.rol || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {emp.telefono || '-'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {emp.email || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!empleadosFiltrados.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No hay empleados que coincidan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}