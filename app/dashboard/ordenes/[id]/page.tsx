"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Printer, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Datos de ejemplo para la orden
const orden = {
  id: "ORD-001",
  cliente: {
    id: "CLI-001",
    nombre: "Juan Pérez",
    telefono: "555-123-4567",
    correo: "juan.perez@example.com",
  },
  dispositivo: "iPhone 12",
  modelo: "A2403",
  problema: "Pantalla rota con daños en el cristal y problemas de respuesta táctil.",
  estado: "en_proceso",
  fecha_ingreso: "2023-05-15",
  fecha_entrega: null,
  costo_estimado: 120,
  tecnico_asignado: {
    id: "TEC-001",
    nombre: "Carlos Ruiz",
  },
  notas: "Cliente menciona que el dispositivo se cayó desde aproximadamente 1 metro de altura.",
  historial: [
    {
      id: "HIST-001",
      fecha: "2023-05-15 09:30",
      estado: "pendiente",
      descripcion: "Orden creada y registrada en el sistema.",
      usuario: "Admin",
    },
    {
      id: "HIST-002",
      fecha: "2023-05-15 14:45",
      estado: "en_proceso",
      descripcion:
        "Asignada a técnico Carlos Ruiz. Diagnóstico inicial: Pantalla rota, se necesita reemplazo completo.",
      usuario: "Admin",
    },
    {
      id: "HIST-003",
      fecha: "2023-05-16 10:15",
      estado: "en_proceso",
      descripcion: "Pedido de repuesto realizado. Tiempo estimado de llegada: 2 días.",
      usuario: "Carlos Ruiz",
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

export default function DetalleOrdenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState(orden.estado)
  const [comentario, setComentario] = useState("")

  const handleActualizarEstado = async () => {
    setLoading(true)

    try {
      // Aquí iría la lógica para actualizar en Supabase
      console.log("Actualizar estado:", {
        id: params.id,
        estado: nuevoEstado,
        comentario,
      })

      // Simular tiempo de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setOpenDialog(false)
      // En un caso real, aquí actualizaríamos los datos locales o recargaríamos la página
    } catch (error) {
      console.error("Error al actualizar el estado:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarOrden = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.")) {
      setLoading(true)

      try {
        // Aquí iría la lógica para eliminar en Supabase
        console.log("Eliminar orden:", params.id)

        // Simular tiempo de carga
        await new Promise((resolve) => setTimeout(resolve, 1000))

        router.push("/dashboard/ordenes")
      } catch (error) {
        console.error("Error al eliminar la orden:", error)
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
            <Link href="/dashboard/ordenes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Orden #{params.id}</h2>
          <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ordenes/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm">Actualizar Estado</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar Estado de la Orden</DialogTitle>
                <DialogDescription>
                  Cambia el estado de la orden y añade un comentario sobre la actualización.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentario">Comentario</Label>
                  <Textarea
                    id="comentario"
                    placeholder="Añade un comentario sobre la actualización"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleActualizarEstado} disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={handleEliminarOrden} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="detalles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                    <dd>{orden.cliente.nombre}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                    <dd>{orden.cliente.telefono}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                    <dd>{orden.cliente.correo}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
                    <dd>{orden.dispositivo}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Modelo</dt>
                    <dd>{orden.modelo}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Problema</dt>
                    <dd>{orden.problema}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Reparación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</dt>
                    <dd>{orden.fecha_ingreso}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Fecha de Entrega Estimada</dt>
                    <dd>{orden.fecha_entrega || "Pendiente"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Costo Estimado</dt>
                    <dd>${orden.costo_estimado.toFixed(2)}</dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Técnico Asignado</dt>
                    <dd>{orden.tecnico_asignado?.nombre || "Sin asignar"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Estado Actual</dt>
                    <dd>
                      <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                    </dd>
                  </div>
                </dl>
              </div>
              {orden.notas && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Notas</h4>
                  <p className="mt-1">{orden.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de la Orden</CardTitle>
              <CardDescription>Registro de cambios y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {orden.historial.map((item) => (
                  <div key={item.id} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10">
                        <Badge variant={getVariantForEstado(item.estado)}>
                          {traducirEstado(item.estado).charAt(0)}
                        </Badge>
                      </div>
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.fecha}</p>
                        <Badge variant={getVariantForEstado(item.estado)}>{traducirEstado(item.estado)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                      <p className="text-xs text-muted-foreground">Por: {item.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

