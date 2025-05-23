"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Trash, BarChart, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para el producto
const productoEjemplo = {
  id: "PROD-001",
  nombre: "Pantalla iPhone 12",
  categoria: "Repuestos",
  descripcion: "Pantalla de reemplazo original para iPhone 12, incluye digitalizador y marco.",
  precio_compra: 80.0,
  precio_venta: 120.0,
  cantidad: 5,
  stock_minimo: 3,
  ubicacion: "Estante A-12",
  proveedor: {
    id: "PROV-001",
    nombre: "TechParts Inc.",
    telefono: "555-123-4567",
    correo: "contacto@techparts.com",
  },
  movimientos: [
    {
      id: "MOV-001",
      tipo: "entrada",
      cantidad: 10,
      fecha: "2023-05-01",
      referencia: "Compra #C-2023-05-01",
      usuario: "Admin",
    },
    {
      id: "MOV-002",
      tipo: "salida",
      cantidad: 2,
      fecha: "2023-05-05",
      referencia: "Venta #VTA-002",
      usuario: "Ana Gómez",
    },
    {
      id: "MOV-003",
      tipo: "salida",
      cantidad: 3,
      fecha: "2023-05-10",
      referencia: "Venta #VTA-005",
      usuario: "Ana Gómez",
    },
  ],
  ventas_recientes: [
    {
      id: "VTA-002",
      fecha: "2023-05-05",
      cliente: "María López",
      cantidad: 2,
      precio: 120.0,
    },
    {
      id: "VTA-005",
      fecha: "2023-05-10",
      cliente: "Pedro Sánchez",
      cantidad: 3,
      precio: 120.0,
    },
  ],
}

// Función para determinar el estado del stock
function getEstadoStock(cantidad: number, stockMinimo: number) {
  if (cantidad === 0) return "agotado"
  if (cantidad <= stockMinimo) return "bajo"
  return "normal"
}

// Función para obtener la variante del badge según el estado del stock
function getVariantForStock(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    normal: "default",
    bajo: "secondary",
    agotado: "destructive",
  }
  return variantes[estado] || "default"
}

// Función para traducir el estado del stock
function traducirEstadoStock(estado: string) {
  const traducciones: Record<string, string> = {
    normal: "En Stock",
    bajo: "Stock Bajo",
    agotado: "Agotado",
  }
  return traducciones[estado] || estado
}

export default function DetalleProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // En una implementación real, cargaríamos el producto desde la base de datos
  const producto = productoEjemplo

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    setLoading(true)

    try {
      // Simulación de eliminación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      })

      router.push("/dashboard/inventario")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calcular el estado del stock
  const estadoStock = getEstadoStock(producto.cantidad, producto.stock_minimo)
  const estadoVariante = getVariantForStock(estadoStock)

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inventario">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{producto.nombre}</h2>
          <Badge variant={estadoVariante}>{traducirEstadoStock(estadoStock)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/inventario/${producto.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
        </TabsList>
        <TabsContent value="detalles" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información del Producto</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{producto.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{producto.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="font-medium">{producto.descripcion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{producto.ubicacion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información de Precios</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Compra</p>
                    <p className="font-medium">${producto.precio_compra.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Venta</p>
                    <p className="font-medium">${producto.precio_venta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                    <p className="font-medium">
                      {(((producto.precio_venta - producto.precio_compra) / producto.precio_compra) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información de Stock</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad Actual</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{producto.cantidad} unidades</p>
                      <Badge variant={estadoVariante}>{traducirEstadoStock(estadoStock)}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                    <p className="font-medium">{producto.stock_minimo} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor en Inventario</p>
                    <p className="font-medium">${(producto.cantidad * producto.precio_compra).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Información del Proveedor</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{producto.proveedor.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{producto.proveedor.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p className="font-medium">{producto.proveedor.correo}</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/proveedores/${producto.proveedor.id}`}>Ver Proveedor</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Registro de entradas y salidas del producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {producto.movimientos.map((movimiento) => (
                  <div key={movimiento.id} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10">
                        {movimiento.tipo === "entrada" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{movimiento.fecha}</p>
                        <Badge variant={movimiento.tipo === "entrada" ? "success" : "secondary"}>
                          {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        {movimiento.tipo === "entrada" ? "+" : "-"}
                        {movimiento.cantidad} unidades
                      </p>
                      <p className="text-sm text-muted-foreground">Referencia: {movimiento.referencia}</p>
                      <p className="text-xs text-muted-foreground">Por: {movimiento.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventas">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>Historial de ventas de este producto</CardDescription>
            </CardHeader>
            <CardContent>
              {producto.ventas_recientes.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No hay ventas recientes para este producto.
                </div>
              ) : (
                <div className="space-y-4">
                  {producto.ventas_recientes.map((venta) => (
                    <div key={venta.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/dashboard/ventas/${venta.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {venta.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">Fecha: {venta.fecha}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{venta.cantidad} unidades</p>
                          <p className="text-sm text-muted-foreground">${venta.precio.toFixed(2)} c/u</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">Cliente: {venta.cliente}</p>
                        <p className="text-sm font-medium mt-1">Total: ${(venta.cantidad * venta.precio).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/inventario/reportes">
                    <BarChart className="mr-2 h-4 w-4" />
                    Ver Reporte Completo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
