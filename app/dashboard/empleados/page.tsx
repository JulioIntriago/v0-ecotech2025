"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "@/components/ui/use-toast";

interface Empleado {
  id: string;
  nombre: string;
  role: string; // Ajustado de cargo a role para consistencia
  telefono: string;
  correo: string;
  fecha_contratacion: string;
  estado: "activo" | "inactivo";
  cedula: string; // Añadido para alineación
  departamento: string; // Añadido para alineación
}

export default function EmpleadosPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role === "admin") {
        setIsAdmin(true);
      } else {
        toast({ title: "Acceso Denegado", description: "Solo los administradores pueden ver esta página.", variant: "destructive" });
        router.push("/dashboard");
      }
    };

    const fetchEmpleados = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("empleados")
          .select("id, nombre, role, telefono, correo, fecha_contratacion, estado, cedula, departamento") // Añadidas cedula y departamento
          .order("nombre", { ascending: true });

        if (error) {
          console.error("Error fetching empleados:", error.message || JSON.stringify(error));
          setError(`No se pudieron cargar los empleados. Detalle: ${error.message || 'Error desconocido'}`);
        } else {
          setEmpleados(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching empleados:", err);
        setError("Ocurrió un error inesperado al cargar los empleados.");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
    if (isAdmin) fetchEmpleados();
  }, [router, isAdmin]);

  const empleadosFiltrados = empleados.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.telefono.includes(searchQuery) ||
      empleado.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.cedula.includes(searchQuery) ||
      empleado.departamento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col gap-4 p-2">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Empleados</h2>
        <Button asChild>
          <Link href="/dashboard/empleados/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, rol, teléfono, correo, cédula, departamento o ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Empleados</CardTitle>
          <CardDescription>Gestiona la información de tu equipo de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando empleados...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha Contratación</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No se encontraron empleados que coincidan con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  empleadosFiltrados.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell>
                        <div className="font-medium">{empleado.nombre}</div>
                        <div className="text-sm text-muted-foreground">{empleado.cedula}</div>
                      </TableCell>
                      <TableCell>{empleado.role}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            {empleado.telefono}
                          </div>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            {empleado.correo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{empleado.fecha_contratacion}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={empleado.estado === "activo" ? "success" : "secondary"}>
                          {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/empleados/${empleado.id}`}>Ver detalles</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}