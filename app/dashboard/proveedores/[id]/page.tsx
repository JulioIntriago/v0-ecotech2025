"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Calendar, Edit, Mail, MapPin, Package, Phone } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Datos de ejemplo para el proveedor
const proveedor = {
  id: "PROV-001",
  nombre: "TechParts Inc.",
  tipo: "Repuestos",
  telefono: "555-123-4567",
  correo: "contacto@techparts.com",
  direccion: "Calle Industrial 123, Ciudad",
  contacto: "Juan Martínez",
  ruc: "1234567890001",
  productos: 15,
  ultima_compra: "2023-05-10",
  fecha_registro: "2023-01-15",
  notas: "Proveedor principal de repuestos para dispositivos Apple. Ofrece descuentos por volumen de compra.",
}

// Datos de ejemplo para productos del proveedor
const productosProveedor = [
  {
    id: "PROD-001",
    nombre: "Pantalla iPhone 12",
    categoria: "Repuestos",
    precio_compra: 80,
    precio_venta: 120,
    stock: 5,
    ultima_compra: "2023-05-10",
  },
  {
    id: "PROD-002",
    nombre: "Batería iPhone 11",
    categoria: "Repuestos",
    precio_compra: 30,
    precio_venta: 45,
    stock: 8,
    ultima_compra: "2023-05-05",
  },
  {
    id: "PROD-003",
    nombre: "Flex de Carga iPhone X",
    categoria: "Repuestos",
    precio_compra: 25,
    precio_venta: 40,
    stock: 6,
    ultima_compra: "2023-04-28",
  },
  {
    id: "PROD-004",
    nombre: "Cámara Trasera iPhone 13",
    categoria: "Repuestos",
    precio_compra: 50,
    precio_venta: 75,
    stock: 4,
    ultima_compra: "2023-05-12",
  },
]

// Datos de ejemplo para historial de compras
const historialCompras = [
  {
    id: "COMP-001",
    fecha: "2023-05-10",
    total: 1200,
    productos: 5,
    estado: "Completada",
  },
  {
    id: "COMP-002",
    fecha: "2023-04-28",
    total: 850,
    productos: 3,
    estado: "Completada",
  },
  {
    id: "COMP-003",
    fecha: "2023-04-15",
    total: 1500,
    productos: 7,
    estado: "Completada",
  },
  {
    id: "COMP-004",
    fecha: "2023-03-22",
    total: 950,
    productos: 4,
    estado: "Completada",
  },
]

export default function DetalleProveedorPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("informacion")

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/proveedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Detalle de Proveedor</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{proveedor.nombre}</CardTitle>
                <CardDescription>ID: {proveedor.id}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/proveedores/${params.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="informacion">Información</TabsTrigger>
                  <TabsTrigger value="productos">Productos</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="informacion" className="space-y-6 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Datos Generales</h4>
                          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span>{proveedor.tipo}</span>
                            <span className="text-muted-foreground">RUC:</span>
                            <span>{proveedor.ruc}</span>
                            <span className="text-muted-foreground">Contacto:</span>
                            <span>{proveedor.contacto}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Información de Contacto</h4>
                          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                            <span className="text-muted-foreground">Teléfono:</span>
                            <span>{proveedor.telefono}</span>
                            <span className="text-muted-foreground">Correo:</span>
                            <span>{proveedor.correo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Dirección</h4>
                          <p className="text-sm">{proveedor.direccion}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Fechas</h4>
                          <div className="grid grid-cols-[140px_1fr] gap-1 text-sm">
                            <span className="text-muted-foreground">Registro:</span>
                            <span>{new Date(proveedor.fecha_registro).toLocaleDateString()}</span>
                            <span className="text-muted-foreground">Última compra:</span>
                            <span>{new Date(proveedor.ultima_compra).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {proveedor.notas && (
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Notas</h4>
                      <p className="text-sm text-muted-foreground">{proveedor.notas}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="productos" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos Suministrados</CardTitle>
                      <CardDescription>Listado de productos que suministra este proveedor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Precio Compra</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productosProveedor.map((producto) => (
                            <TableRow key={producto.id}>
                              <TableCell className="font-medium">{producto.nombre}</TableCell>
                              <TableCell>{producto.categoria}</TableCell>
                              <TableCell className="text-right">${producto.precio_compra.toFixed(2)}</TableCell>
                              <TableCell className="text-right">${producto.precio_venta.toFixed(2)}</TableCell>
                              <TableCell className="text-center">
                                <span className={producto.stock <= 3 ? "text-red-500 font-medium" : ""}>
                                  {producto.stock}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="historial" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Compras</CardTitle>
                      <CardDescription>Registro de compras realizadas a este proveedor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-center">Productos</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historialCompras.map((compra) => (
                            <TableRow key={compra.id}>
                              <TableCell className="font-medium">{compra.id}</TableCell>
                              <TableCell>{new Date(compra.fecha).toLocaleDateString()}</TableCell>
                              <TableCell className="text-center">{compra.productos}</TableCell>
                              <TableCell className="text-right">${compra.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {compra.estado}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productos:</span>
                <span className="font-medium">{proveedor.productos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última compra:</span>
                <span className="font-medium">{new Date(proveedor.ultima_compra).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{proveedor.tipo}</Badge>
              </div>

              <div className="pt-2">
                <Button className="w-full" asChild>
                  <Link href="/dashboard/inventario/nuevo">
                    <Package className="mr-2 h-4 w-4" />
                    Nueva Compra
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`mailto:${proveedor.correo}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Correo
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`tel:${proveedor.telefono}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/proveedores/${params.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Proveedor
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
