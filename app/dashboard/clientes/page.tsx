"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Phone, Mail } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Datos de ejemplo para clientes
const clientes = [
  {
    id: "CLI-001",
    nombre: "Juan Pérez",
    telefono: "555-123-4567",
    correo: "juan.perez@example.com",
    ordenes_activas: 2,
    total_gastado: 245.99,
    ultima_visita: "2023-05-15",
  },
  {
    id: "CLI-002",
    nombre: "María López",
    telefono: "555-987-6543",
    correo: "maria.lopez@example.com",
    ordenes_activas: 1,
    total_gastado: 78.5,
    ultima_visita: "2023-05-14",
  },
  {
    id: "CLI-003",
    nombre: "Carlos Ruiz",
    telefono: "555-456-7890",
    correo: "carlos.ruiz@example.com",
    ordenes_activas: 0,
    total_gastado: 350.75,
    ultima_visita: "2023-05-10",
  },
  {
    id: "CLI-004",
    nombre: "Ana Gómez",
    telefono: "555-234-5678",
    correo: "ana.gomez@example.com",
    ordenes_activas: 1,
    total_gastado: 120.0,
    ultima_visita: "2023-05-12",
  },
  {
    id: "CLI-005",
    nombre: "Pedro Sánchez",
    telefono: "555-876-5432",
    correo: "pedro.sanchez@example.com",
    ordenes_activas: 0,
    total_gastado: 55.75,
    ultima_visita: "2023-05-08",
  },
  {
    id: "CLI-006",
    nombre: "Lucía Martínez",
    telefono: "555-345-6789",
    correo: "lucia.martinez@example.com",
    ordenes_activas: 1,
    total_gastado: 189.99,
    ultima_visita: "2023-05-13",
  },
  {
    id: "CLI-007",
    nombre: "Roberto Díaz",
    telefono: "555-654-3210",
    correo: "roberto.diaz@example.com",
    ordenes_activas: 0,
    total_gastado: 42.5,
    ultima_visita: "2023-05-05",
  },
  {
    id: "CLI-008",
    nombre: "Elena Torres",
    telefono: "555-765-4321",
    correo: "elena.torres@example.com",
    ordenes_activas: 2,
    total_gastado: 267.25,
    ultima_visita: "2023-05-14",
  },
]

export default function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.telefono.includes(searchQuery) ||
      cliente.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            placeholder="Buscar por nombre, teléfono, correo o ID..."
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
                  <TableCell colSpan={6} className="text-center">
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
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {cliente.telefono}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {cliente.correo}
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
  )
}

