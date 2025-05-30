import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, DollarSign, Package, Users } from "lucide-react";

interface DashboardCardsProps {
  metrics: {
    activeOrders: number;
    monthlySales: number;
    stockItems: number;
    lowStockItems: number;
    newClients: number;
  };
}

export function DashboardCards({ metrics }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeOrders}</div>
          <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.monthlySales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.stockItems}</div>
          <p className="text-xs text-muted-foreground">{metrics.lowStockItems} productos con stock bajo</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.newClients}</div>
          <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p>
        </CardContent>
      </Card>
    </div>
  );
}