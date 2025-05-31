import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, DollarSign, Package, Users } from "lucide-react";

interface DashboardCardsProps {
  metrics: {
    activeOrders: { current: number; previous: number };
    monthlySales: { current: number; previous: number };
    stockItems: number;
    lowStockItems: number;
    newClients: { current: number; previous: number };
  };
}

export function DashboardCards({ metrics }: DashboardCardsProps) {
  const calcPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeOrders.current}</div>
          <p className="text-xs text-muted-foreground">
            {calcPercentageChange(metrics.activeOrders.current, metrics.activeOrders.previous)} desde el periodo anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.monthlySales.current.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {calcPercentageChange(metrics.monthlySales.current, metrics.monthlySales.previous)} desde el periodo anterior
          </p>
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
          <div className="text-2xl font-bold">{metrics.newClients.current}</div>
          <p className="text-xs text-muted-foreground">
            {calcPercentageChange(metrics.newClients.current, metrics.newClients.previous)} desde el periodo anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
}