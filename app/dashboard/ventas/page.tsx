"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronDown, Download, FileText, MoreHorizontal, Plus, Printer, Search, SlidersHorizontal, X, Eye, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker";
import { format, subDays } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Venta {
  id: string;
  fecha_venta: string;
  cliente_nombre: string;
  cliente_id: string | null;
  total: number;
  metodo_pago: string;
  estado: string;
  usuario: string;
  productos_venta: ProductoVendido[];
}

interface ProductoVendido {
  id: string;
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
}

export default function VentasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [metodoPago, setMetodoPago] = useState<string>("todos");
  const [estado, setEstado] = useState<string>("todos");
  const [vendedor, setVendedor] = useState<string>("todos");
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("todos");
  const [montoMinimo, setMontoMinimo] = useState<string>("");
  const [montoMaximo, setMontoMaximo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>("fecha_venta");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [allVentas, setAllVentas] = useState<Venta[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const { data: ventasData, error } = await supabase
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          cliente_id,
          clientes:clientes(nombre),
          total,
          metodo_pago,
          estado,
          usuario,
          detalle_venta(
            id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal,
            productos:productos(nombre, precio)
          )
        `)
        .order('fecha_venta', { ascending: false });

      if (error) throw error;

      const ventasConProductos = (ventasData || []).map((venta: any) => ({
        ...venta,
        fecha_venta: venta.fecha_venta,
        cliente_nombre: venta.clientes?.nombre || 'Cliente no especificado',
        productos_venta: venta.detalle_venta?.map((detalle: any) => ({
          id: detalle.id,
          producto_id: detalle.producto_id,
          nombre: detalle.productos?.nombre || 'Producto desconocido',
          precio: detalle.precio_unitario || 0,
          cantidad: detalle.cantidad || 0,
          subtotal: detalle.subtotal || 0
        })) || []
      }));

      setAllVentas(ventasConProductos);
      setVentasFiltradas(ventasConProductos);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: `Error al cargar ventas: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsData = async () => {
    try {
      const { data: clientesData, error } = await supabase
        .from('clientes')
        .select('id, nombre, email, telefono')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setClientes(clientesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al cargar clientes: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchVendedores = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('usuario')
        .not('usuario', 'is', null);
      if (error) throw error;
      const uniqueVendedores = [...new Set(data?.map((venta: any) => venta.usuario))];
      setVendedores(uniqueVendedores);
    } catch (error: any) {
      console.error('Error fetching vendedores:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
    fetchClientsData();
    fetchVendedores();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    setLoading(true);
    let filtered = [...allVentas];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venta => 
        venta.id.toLowerCase().includes(query) || 
        venta.cliente_nombre.toLowerCase().includes(query)
      );
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(venta => {
        const ventaDate = new Date(venta.fecha_venta);
        return ventaDate >= dateRange.from && ventaDate <= dateRange.to;
      });
    }

    if (metodoPago !== "todos") {
      filtered = filtered.filter(venta => venta.metodo_pago === metodoPago);
    }

    if (estado !== "todos") {
      filtered = filtered.filter(venta => venta.estado === estado);
    }

    if (vendedor !== "todos") {
      filtered = filtered.filter(venta => venta.usuario === vendedor);
    }

    if (montoMinimo) {
      filtered = filtered.filter(venta => venta.total >= Number(montoMinimo));
    }

    if (montoMaximo) {
      filtered = filtered.filter(venta => venta.total <= Number(montoMaximo));
    }

    if (clienteSeleccionado !== "todos") {
      filtered = filtered.filter(venta => venta.cliente_id === clienteSeleccionado);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "fecha_venta":
          comparison = new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime();
          break;
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "cliente_nombre":
          comparison = (a.cliente_nombre || "").localeCompare(b.cliente_nombre || "");
          break;
        case "total":
          comparison = a.total - b.total;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setVentasFiltradas(filtered);
    setCurrentPage(1);
    setLoading(false);
  }, [searchQuery, dateRange, metodoPago, estado, vendedor, montoMinimo, montoMaximo, clienteSeleccionado, sortField, sortDirection, allVentas]);

  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVentas = ventasFiltradas.slice(startIndex, startIndex + itemsPerPage);

  const clearAllFilters = () => {
    setSearchQuery("");
    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
    setMetodoPago("todos");
    setEstado("todos");
    setVendedor("todos");
    setClienteSeleccionado("todos");
    setMontoMinimo("");
    setMontoMaximo("");
  };

  const exportToCSV = () => {
    const headers = ["ID", "Fecha", "Cliente", "Total", "Método Pago", "Estado", "Vendedor"];
    const rows = ventasFiltradas.map(venta => [
      venta.id,
      format(new Date(venta.fecha_venta), "dd/MM/yyyy HH:mm"),
      venta.cliente_nombre,
      venta.total.toFixed(2),
      venta.metodo_pago,
      venta.estado,
      venta.usuario
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ventas_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.click();
    
    toast({
      title: "Exportación completada",
      description: `Se exportaron ${ventasFiltradas.length} registros`,
    });
  };

  const anularVenta = async (ventaId: string) => {
    if (!confirm("¿Está seguro que desea anular esta venta?")) return;

    try {
      const { error } = await supabase
        .from("ventas")
        .update({ estado: "anulada" })
        .eq("id", ventaId);

      if (error) throw error;

      toast({
        title: "Venta anulada",
        description: `La venta ${ventaId} ha sido anulada correctamente.`,
      });

      await fetchSalesData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo anular la venta: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const estadisticas = {
    totalVentas: ventasFiltradas.length,
    ventasCompletadas: ventasFiltradas.filter(v => v.estado === "completada").length,
    ventasAnuladas: ventasFiltradas.filter(v => v.estado === "anulada").length,
    ventasPendientes: ventasFiltradas.filter(v => v.estado === "pendiente").length,
    montoTotal: ventasFiltradas
      .filter(v => v.estado === "completada")
      .reduce((sum, v) => sum + v.total, 0),
    promedioVenta:
      ventasFiltradas.filter(v => v.estado === "completada").length > 0
        ? ventasFiltradas
            .filter(v => v.estado === "completada")
            .reduce((sum, v) => sum + v.total, 0) /
          ventasFiltradas.filter(v => v.estado === "completada").length
        : 0,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Historial de Ventas</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/ventas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "Función en desarrollo" })}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "Función en desarrollo" })}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalVentas}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.ventasCompletadas} completadas, {estadisticas.ventasAnuladas} anuladas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.montoTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Solo ventas completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.promedioVenta.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Basado en ventas completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.ventasPendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID o cliente..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DatePickerWithRange 
          date={dateRange} 
          setDate={setDateRange} 
          className="w-full md:w-auto" 
        />

        <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
          {showAdvancedFilters ? <X className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mostrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Filtros Avanzados</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </div>
            <CardDescription>Utiliza estos filtros para encontrar ventas específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="metodo-pago">Método de Pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger id="metodo-pago">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="anulada">Anulada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedor">Vendedor</Label>
                <Select value={vendedor} onValueChange={setVendedor}>
                  <SelectTrigger id="vendedor">
                    <SelectValue placeholder="Seleccionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {vendedores.map((vend) => (
                      <SelectItem key={vend} value={vend}>
                        {vend}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto-minimo">Monto Mínimo</Label>
                <Input
                  id="monto-minimo"
                  type="number"
                  placeholder="0.00"
                  value={montoMinimo}
                  onChange={(e) => setMontoMinimo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto-maximo">Monto Máximo</Label>
                <Input
                  id="monto-maximo"
                  type="number"
                  placeholder="0.00"
                  value={montoMaximo}
                  onChange={(e) => setMontoMaximo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando ventas...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                    ID {renderSortIndicator("id")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("fecha_venta")}>
                    Fecha {renderSortIndicator("fecha_venta")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("cliente_nombre")}>
                    Cliente {renderSortIndicator("cliente_nombre")}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("total")}>
                    Total {renderSortIndicator("total")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Método de Pago</TableHead>
                  <TableHead className="hidden lg:table-cell">Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Vendedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {allVentas.length === 0 
                        ? "No se encontraron ventas" 
                        : "No hay ventas que coincidan con los filtros"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVentas.map((venta) => (
                    <TableRow key={venta.id} className={venta.estado === "anulada" ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{venta.id.substring(0, 8)}...</TableCell>
                      <TableCell>{format(new Date(venta.fecha_venta), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>{venta.cliente_nombre}</TableCell>
                      <TableCell className="text-right">
                        ${venta.total.toFixed(2)}
                        {venta.productos_venta.some(p => p.precio > 0) && (
                          <Badge variant="outline" className="ml-2 bg-green-50">
                            Con productos
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{venta.metodo_pago}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={
                            venta.estado === "completada"
                              ? "default"
                              : venta.estado === "anulada"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {venta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{venta.usuario}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/ventas/${venta.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "Función en desarrollo" })}>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir recibo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "Función en desarrollo" })}>
                              <FileText className="mr-2 h-4 w-4" />
                              Generar factura
                            </DropdownMenuItem>
                            {venta.estado === "completada" && (
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => anularVenta(venta.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Anular venta
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {ventasFiltradas.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, ventasFiltradas.length)} de{" "}
            {ventasFiltradas.length} ventas
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}