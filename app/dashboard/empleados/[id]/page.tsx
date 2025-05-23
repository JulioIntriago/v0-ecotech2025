"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash, CreditCard, Briefcase, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para el empleado
const empleado = {
  id: "EMP-001",
  nombre: "Carlos Ruiz",
  cedula: "1122334455",
  cargo: "Técnico",
  telefono: "555-456-7890",
  correo: "carlos.ruiz@ecotech.com",
  direccion: "Calle Secundaria 456, Ciudad",
  estado: "activo",
  fecha_contratacion: "2022-01-15",
  departamento: "Servicio Técnico",
  supervisor: "Sofía Ramírez",
  horario: "Lunes a Viernes, 9:00 - 18:00",
  ordenes_asignadas: [
    {
      id: "ORD-001",
      cliente: "Juan Pérez",
      dispositivo: "iPhone 12",
      problema: "Pantalla rota",
      estado: "en_proceso",
      fecha_ingreso: "2023-05-15",
    },
    {
      id: "ORD-005",
      cliente: "Pedro Sánchez",
      dispositivo: "iPhone 11",
      problema: "Cámara",
      estado: "en_proceso",
      fecha_ingreso: "2023-05-11",
    },
    {
      id: "ORD-008",
      cliente: "Elena Torres",
      dispositivo: "Samsung A52",
      problema: "Botones físicos",
      estado: "finalizado",
      fecha_ingreso: "2023-05-14",
    },
  ],
  ventas_realizadas: [
    {
      id: "VTA-002",
      cliente: "María López",
      fecha: "2023-05-14",
      total: 78.5,
    },
    {
      id: "VTA-005",
      cliente: "Pedro Sánchez",
      fecha: "2023-05-13",
      total: 55.75,
    },
  ],
}

// Función para traducir el estado
function traducirEstado(estado: string) {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
  }
  return traducciones[estado] || estado
}

// Función para determinar la variante del badge según el estado
function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  }
  return variantes[estado] || "default"
}

export default function DetalleEmpleadoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEliminarEmpleado = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
      setLoading(true)

      try {
        // Simulación de eliminación
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Empleado eliminado",
          description: "El empleado ha sido eliminado correctamente.",
        })

        router.push("/dashboard/empleados")
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/empleados">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{empleado.nombre}</h2>
          <span className="text-sm text-muted-foreground">{empleado.id}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/empleados/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEliminarEmpleado} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="informacion">
        <TabsList>
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes Asignadas</TabsTrigger>
          <TabsTrigger value="ventas">Ventas Realizadas</TabsTrigger>
        </TabsList>
        <TabsContent value="informacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Cédula</dt>
                  <dd className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.cedula}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.telefono}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
                  <dd className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.correo}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.direccion}</span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Cargo</dt>
                  <dd className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.cargo}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Departamento</dt>
                  <dd>{empleado.departamento}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Fecha de Contratación</dt>
                  <dd className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.fecha_contratacion}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                  <dd>
                    <Badge variant={empleado.estado === "activo" ? "success" : "secondary"}>
                      {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Supervisor</dt>
                  <dd>{empleado.supervisor}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Horario</dt>
                  <dd>{empleado.horario}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordenes">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Asignadas</CardTitle>
              <CardDescription>Órdenes de reparación asignadas a este empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
                    <TableHead className="hidden md:table-cell">Problema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleado.ordenes_asignadas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Este empleado no tiene órdenes asignadas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    empleado.ordenes_asignadas.map((orden) => (
                      <TableRow key={orden.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/ordenes/${orden.id}`} className="text-primary hover:underline">
                            {orden.id}
                          </Link>
                        </TableCell>
                        <TableCell>{orden.cliente}</TableCell>
                        <TableCell className="hidden md:table-cell">{orden.dispositivo}</TableCell>
                        <TableCell className="hidden md:table-cell">{orden.problema}</TableCell>
                        <TableCell>
                          <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{orden.fecha_ingreso}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventas">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Realizadas</CardTitle>
              <CardDescription>Ventas realizadas por este empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleado.ventas_realizadas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Este empleado no ha realizado ventas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    empleado.ventas_realizadas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/ventas/${venta.id}`} className="text-primary hover:underline">
                            {venta.id}
                          </Link>
                        </TableCell>
                        <TableCell>{venta.cliente}</TableCell>
                        <TableCell>{venta.fecha}</TableCell>
                        <TableCell className="text-right">${venta.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
