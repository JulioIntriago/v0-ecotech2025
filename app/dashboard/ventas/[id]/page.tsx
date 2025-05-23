"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, CreditCard, FileText, Mail, Printer, RefreshCw, User, X } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipos
interface Venta {
  id: string
  fecha: string
  cliente: string | null
  cliente_id: string | null
  cliente_info?: {
    nombre: string
    email: string | null
    telefono: string | null
    direccion: string | null
  }
  total: number
  subtotal: number
  impuestos: number
  metodo_pago: string
  estado: string
  usuario: string
  descuento_general: number
  descuento_tipo: string
  productos: ProductoVendido[]
  notas?: string
}

interface ProductoVendido {
  id: string
  nombre: string
  precio: number
  cantidad: number
  descuento: number
  descuento_tipo: string
  subtotal: number
}

// Datos de ejemplo para la venta
const getVentaDetalle = (id: string): Venta => {
  // En una implementación real, esto vendría de una API
  return {
    id,
    fecha: "2023-05-15T14:30:00",
    cliente: "Juan Pérez",
    cliente_id: "CLI-001",
    cliente_info: {
      nombre: "Juan Pérez",
      email: "juan@example.com",
      telefono: "555-1234",
      direccion: "Calle Principal 123",
    },
    total: 145.99,
    subtotal: 125.85,
    impuestos: 20.14,
    metodo_pago: "Efectivo",
    estado: "completada",
    usuario: "Admin",
    descuento_general: 10,
    descuento_tipo: "porcentaje",
    productos: [
      {
        id: "PRD-001",
        nombre: "Protector de pantalla iPhone 13",
        precio: 15.99,
        cantidad: 2,
        descuento: 0,
        descuento_tipo: "porcentaje",
        subtotal: 31.98,
      },
      {
        id: "PRD-002",
        nombre: "Cargador rápido USB-C",
        precio: 29.99,
        cantidad: 1,
        descuento: 5,
        descuento_tipo: "porcentaje",
        subtotal: 28.49,
      },
      {
        id: "PRD-003",
        nombre: "Funda protectora Samsung Galaxy S21",
        precio: 24.99,
        cantidad: 1,
        descuento: 0,
        descuento_tipo: "porcentaje",
        subtotal: 24.99,
      },
      {
        id: "PRD-004",
        nombre: "Auriculares inalámbricos",
        precio: 49.99,
        cantidad: 1,
        descuento: 10,
        descuento_tipo: "porcentaje",
        subtotal: 44.99,
      },
    ],
    notas: "Cliente frecuente. Solicitó factura electrónica.",
  }
}

// Historial de cambios de ejemplo
const historialCambios = [
  {
    fecha: "2023-05-15T14:30:00",
    usuario: "Admin",
    accion: "Venta creada",
    detalles: "Venta registrada correctamente",
  },
  {
    fecha: "2023-05-15T14:35:00",
    usuario: "Admin",
    accion: "Recibo impreso",
    detalles: "Se imprimió el recibo para el cliente",
  },
  {
    fecha: "2023-05-15T14:40:00",
    usuario: "Admin",
    accion: "Factura generada",
    detalles: "Se generó la factura electrónica",
  },
]

export default function DetalleVentaPage() {
  const params = useParams()
  const router = useRouter()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("detalles")

  useEffect(() => {
    // Simulación de carga de datos
    const fetchData = async () => {
      setLoading(true)
      try {
        // En una implementación real, esto sería una llamada a API
        const ventaData = getVentaDetalle(params.id as string)
        setVenta(ventaData)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  // Calcular el descuento total
  const calcularDescuentoTotal = () => {
    if (!venta) return 0

    // Descuentos por producto
    const descuentosProductos = venta.productos.reduce((total, producto) => {
      if (producto.descuento_tipo === "porcentaje") {
        return total + (producto.precio * producto.cantidad * producto.descuento) / 100
      } else {
        return total + Math.min(producto.descuento, producto.precio * producto.cantidad)
      }
    }, 0)

    // Descuento general
    let descuentoGeneral = 0
    const subtotalSinDescuentos = venta.productos.reduce((total, p) => total + p.precio * p.cantidad, 0)

    if (venta.descuento_general > 0) {
      if (venta.descuento_tipo === "porcentaje") {
        descuentoGeneral = subtotalSinDescuentos * (venta.descuento_general / 100)
      } else {
        descuentoGeneral = venta.descuento_general
      }
    }

    return descuentosProductos + descuentoGeneral
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardHeader />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/ventas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Cargando detalles de venta...</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardHeader />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/ventas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Venta no encontrada</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <X className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No se encontró la venta solicitada. Es posible que haya sido eliminada o que no exista.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/ventas">Volver al listado de ventas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const descuentoTotal = calcularDescuentoTotal()
  const fechaFormateada = format(new Date(venta.fecha), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/ventas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Venta {venta.id}</h2>
            <p className="text-muted-foreground">{fechaFormateada}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir recibo
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generar factura
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Enviar por correo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información principal */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Detalles de la venta</CardTitle>
              <Badge variant={venta.estado === "completada" ? "default" : "destructive"}>{venta.estado}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="productos">Productos</TabsTrigger>
                <TabsTrigger value="historial">Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="detalles" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">ID de Venta</p>
                    <p className="font-medium">{venta.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                    <p className="font-medium">{fechaFormateada}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <p className="font-medium">{venta.cliente || "Cliente anónimo"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                    <p className="font-medium">{venta.metodo_pago}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Vendedor</p>
                    <p className="font-medium">{venta.usuario}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant={venta.estado === "completada" ? "default" : "destructive"}>{venta.estado}</Badge>
                  </div>
                </div>

                {venta.notas && (
                  <div className="pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm">{venta.notas}</p>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${venta.subtotal.toFixed(2)}</span>
                  </div>

                  {descuentoTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuentos</span>
                      <span>-${descuentoTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Impuestos (IVA)</span>
                    <span>${venta.impuestos.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${venta.total.toFixed(2)}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="productos">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Descuento</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venta.productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-xs text-muted-foreground">{producto.id}</div>
                        </TableCell>
                        <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{producto.cantidad}</TableCell>
                        <TableCell className="text-right">
                          {producto.descuento > 0 ? (
                            <span className="text-green-600">
                              {producto.descuento_tipo === "porcentaje"
                                ? `${producto.descuento}%`
                                : `$${producto.descuento.toFixed(2)}`}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">${producto.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}

                    {/* Filas de resumen */}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-medium">${venta.subtotal.toFixed(2)}</TableCell>
                    </TableRow>

                    {descuentoTotal > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium text-green-600">
                          Descuentos
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          -${descuentoTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Impuestos (IVA)
                      </TableCell>
                      <TableCell className="text-right font-medium">${venta.impuestos.toFixed(2)}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-lg">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">${venta.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="historial">
                <div className="space-y-4">
                  {historialCambios.map((cambio, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {cambio.accion.includes("Venta") && <CreditCard className="h-5 w-5 text-primary" />}
                        {cambio.accion.includes("Recibo") && <Printer className="h-5 w-5 text-primary" />}
                        {cambio.accion.includes("Factura") && <FileText className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{cambio.accion}</p>
                        <p className="text-sm text-muted-foreground">{cambio.detalles}</p>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(cambio.fecha), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {cambio.usuario}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Información del cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {venta.cliente_info ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="font-medium">{venta.cliente_info.nombre}</p>
                </div>

                {venta.cliente_info.email && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{venta.cliente_info.email}</p>
                  </div>
                )}

                {venta.cliente_info.telefono && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{venta.cliente_info.telefono}</p>
                  </div>
                )}

                {venta.cliente_info.direccion && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="font-medium">{venta.cliente_info.direccion}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/clientes/${venta.cliente_id}`}>Ver perfil completo</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Venta realizada a cliente anónimo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {venta.estado === "completada" && (
        <div className="flex justify-end">
          <Button variant="destructive">Anular venta</Button>
        </div>
      )}
    </div>
  )
}
