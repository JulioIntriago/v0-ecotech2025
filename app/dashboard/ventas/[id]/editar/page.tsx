"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Minus, Plus, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para la venta
const ventaEjemplo = {
  id: "VTA-001",
  fecha: "2023-05-15",
  hora: "14:30",
  cliente: {
    id: "CLI-001",
    nombre: "Juan Pérez",
  },
  vendedor: {
    id: "EMP-004",
    nombre: "Ana Gómez",
  },
  productos: [
    {
      id: "PROD-001",
      nombre: "Pantalla iPhone 12",
      precio_unitario: 105.0,
      cantidad: 1,
      subtotal: 105.0,
    },
    {
      id: "PROD-003",
      nombre: "Cargador USB-C",
      precio_unitario: 15.99,
      cantidad: 1,
      subtotal: 15.99,
    },
    {
      id: "PROD-005",
      nombre: "Funda iPhone 12",
      precio_unitario: 25.0,
      cantidad: 1,
      subtotal: 25.0,
    },
  ],
  metodo_pago: "Efectivo",
  subtotal: 145.99,
  impuesto: 23.36,
  total: 169.35,
  estado: "completada",
  notas: "Cliente solicitó factura. Se entregó garantía por la pantalla de 3 meses.",
}

// Datos de ejemplo para clientes y productos
const clientes = [
  { id: "CLI-001", nombre: "Juan Pérez" },
  { id: "CLI-002", nombre: "María López" },
  { id: "CLI-003", nombre: "Carlos Ruiz" },
  { id: "CLI-004", nombre: "Ana Gómez" },
  { id: "CLI-005", nombre: "Pedro Sánchez" },
]

const productos = [
  {
    id: "PROD-001",
    nombre: "Pantalla iPhone 12",
    categoria: "Repuestos",
    precio: 105.0,
    cantidad: 5,
  },
  {
    id: "PROD-002",
    nombre: "Batería Samsung S21",
    categoria: "Repuestos",
    precio: 45.0,
    cantidad: 8,
  },
  {
    id: "PROD-003",
    nombre: "Cargador USB-C",
    categoria: "Accesorios",
    precio: 15.99,
    cantidad: 12,
  },
  {
    id: "PROD-004",
    nombre: "Protector Pantalla iPhone 13",
    categoria: "Accesorios",
    precio: 10.0,
    cantidad: 25,
  },
  {
    id: "PROD-005",
    nombre: "Funda iPhone 12",
    categoria: "Accesorios",
    precio: 25.0,
    cantidad: 15,
  },
]

// Métodos de pago disponibles
const metodosPago = ["Efectivo", "Tarjeta", "Transferencia"]

interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export default function EditarVentaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([])
  const [notas, setNotas] = useState("")
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Cargar datos de la venta
  useEffect(() => {
    // En una implementación real, cargaríamos la venta desde la base de datos
    const venta = ventaEjemplo

    setClienteId(venta.cliente.id)
    setMetodoPago(venta.metodo_pago)
    setCarrito(venta.productos)
    setNotas(venta.notas)
  }, [params.id])

  // Actualizar total cuando cambia el carrito
  useEffect(() => {
    const nuevoSubtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0)
    const nuevoImpuesto = nuevoSubtotal * 0.16 // 16% de impuesto
    const nuevoTotal = nuevoSubtotal + nuevoImpuesto
    setTotal(nuevoTotal)
  }, [carrito])

  // Agregar producto al carrito
  const agregarProducto = (producto: (typeof productos)[0]) => {
    const productoExistente = carrito.find((item) => item.id === producto.id)

    if (productoExistente) {
      // Si ya existe, incrementar cantidad
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item,
        ),
      )
    } else {
      // Si no existe, agregar nuevo
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ])
    }
  }

  // Incrementar cantidad de un producto en el carrito
  const incrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio,
            }
          : item,
      ),
    )
  }

  // Decrementar cantidad de un producto en el carrito
  const decrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.precio,
            }
          : item,
      ),
    )
  }

  // Eliminar producto del carrito
  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  // Actualizar la venta
  const actualizarVenta = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    if (!metodoPago) {
      alert("Selecciona un método de pago")
      return
    }

    setLoading(true)

    try {
      // Aquí iría la lógica para actualizar en Supabase
      console.log("Datos actualizados de la venta:", {
        id: params.id,
        cliente_id: clienteId,
        metodo_pago: metodoPago,
        total,
        productos: carrito,
        notas,
      })

      // Simular tiempo de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Venta actualizada",
        description: "La venta ha sido actualizada correctamente.",
      })

      // Redireccionar a la vista de detalles
      router.push(`/dashboard/ventas/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la venta.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/ventas/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Editar Venta #{params.id}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos en la Venta</CardTitle>
              <CardDescription>Edita los productos incluidos en esta venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carrito.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No hay productos en la venta. Agrega productos para continuar.
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => decrementarCantidad(item.id)}
                            disabled={item.cantidad <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrementar</span>
                          </Button>
                          <div className="flex h-8 w-10 items-center justify-center text-sm">{item.cantidad}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => incrementarCantidad(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Incrementar</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
              <CardDescription>Busca y agrega productos adicionales a la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{producto.cantidad}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => agregarProducto(producto)}
                          disabled={producto.cantidad === 0}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Agregar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Venta</CardTitle>
              <CardDescription>Información general de la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anonymous">Cliente Anónimo</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago} required>
                    <SelectTrigger id="metodo_pago">
                      <SelectValue placeholder="Selecciona un método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {metodosPago.map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          {metodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas adicionales sobre la venta"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between border-t pt-4">
                <div className="text-lg font-semibold">Total:</div>
                <div className="text-xl font-\
