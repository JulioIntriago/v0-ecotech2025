"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash, CreditCard, Briefcase, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Orden {
  id: string
  cliente: string
  dispositivo: string
  problema: string
  estado: string
  fecha_ingreso: string
}

interface Venta {
  id: string
  cliente: string
  fecha: string
  total: number
}

interface Empleado {
  id: string
  nombre: string
  cedula: string
  cargo: string
  telefono: string
  correo: string
  direccion: string
  estado: "activo" | "inactivo"
  fecha_contratacion: string
  departamento: string
  supervisor: string
  horario: string
  ordenes_asignadas: Orden[]
  ventas_realizadas: Venta[]
}

function traducirEstado(estado: string) {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
  }
  return traducciones[estado] || estado
}

function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  }
  return variantes[estado] || "default"
}

export default function DetalleEmpleadoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  useEffect(() => {
    const fetchEmpleado = async () => {
      setLoading(true)
      setError(null)

      // Obtener datos del empleado
      const { data: empleadoData, error: empleadoError } = await supabase
        .from("empleados")
        .select("*")
        .eq("id", id)
        .single()

      if (empleadoError) {
        console.error("Error fetching empleado:", empleadoError)
        setError("No se pudo cargar el empleado. Intenta de nuevo más tarde.")
        setLoading(false)
        return
      }

      // Obtener órdenes asignadas
      const { data: ordenesData, error: ordenesError } = await supabase
        .from("ordenes")
        .select("*")
        .eq("empleado_id", id)

      if (ordenesError) {
        console.error("Error fetching órdenes:", ordenesError)
        setError("No se pudieron cargar las órdenes asignadas.")
        setLoading(false)
        return
      }

      // Obtener ventas realizadas
      const { data: ventasData, error: ventasError } = await supabase
        .from("ventas")
        .select("*")
        .eq("empleado_id", id)

      if (ventasError) {
        console.error("Error fetching ventas:", ventasError)
        setError("No se pudieron cargar las ventas realizadas.")
        setLoading(false)
        return
      }

      setEmpleado({
        ...empleadoData,
        ordenes_asignadas: ordenesData || [],
        ventas_realizadas: ventasData || [],
      })
      setLoading(false)
    }

    if (id) {
      fetchEmpleado()
    }
  }, [id])

  const handleEliminarEmpleado = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
      setLoadingDelete(true)

      try {
        const { error } = await supabase
          .from("empleados")
          .delete()
          .eq("id", id)

        if (error) throw error

        toast({
          title: "Empleado eliminado",
          description: "El empleado ha sido eliminado correctamente.",
        })

        router.push("/dashboard/empleados")
      } catch (error) {
        console.error("Error deleting empleado:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado.",
          variant: "destructive",
        })
      } finally {
        setLoadingDelete(false)
      }
    }
  }

  if (loading) {
    return <div className="flex flex-col gap-4 p-2"><DashboardHeader /><div>Cargando empleado...</div></div>
  }

  if (error || !empleado) {
    return <div className="flex flex-col gap-4 p-2"><DashboardHeader /><div className="text-red-500">{error || "Empleado no encontrado."}</div></div>
  }

  return (
    <div className="flex flex-col gap-4 p-2">
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
            <Link href={`/dashboard/empleados/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEliminarEmpleado} disabled={loadingDelete}>
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
                    <span>{empleado.cedula || "No especificado"}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.telefono || "No especificado"}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
                  <dd className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.correo || "No especificado"}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.direccion || "No especificado"}</span>
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
                    <span>{empleado.cargo || "No especificado"}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Departamento</dt>
                  <dd>{empleado.departamento || "No especificado"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Fecha de Contratación</dt>
                  <dd className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.fecha_contratacion || "No especificado"}</span>
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
                  <dd>{empleado.supervisor || "No especificado"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Horario</dt>
                  <dd>{empleado.horario || "No especificado"}</dd>
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
                        <TableCell>{orden.cliente || "No especificado"}</TableCell>
                        <TableCell className="hidden md:table-cell">{orden.dispositivo || "No especificado"}</TableCell>
                        <TableCell className="hidden md:table-cell">{orden.problema || "No especificado"}</TableCell>
                        <TableCell>
                          <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{orden.fecha_ingreso || "No especificado"}</TableCell>
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
                        <TableCell>{venta.cliente || "No especificado"}</TableCell>
                        <TableCell>{venta.fecha || "No especificado"}</TableCell>
                        <TableCell className="text-right">${(venta.total || 0).toFixed(2)}</TableCell>
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