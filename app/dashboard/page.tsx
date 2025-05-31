"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { DatePickerWithRange, DateRange } from "@/components/dashboard/date-range-picker";

// Definición de tipos para las respuestas de Supabase
interface PermissionModule {
  name: string;
}

interface Permission {
  permission_modules: PermissionModule[];
}

interface Sale {
  total: number | null;
}

interface InventoryItem {
  stock: number | null;
  stock_minimo: number | null;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    activeOrders: { current: 0, previous: 0 },
    monthlySales: { current: 0, previous: 0 },
    stockItems: 0,
    lowStockItems: 0,
    newClients: { current: 0, previous: 0 },
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDataAndAuth = async () => {
      // Verificar autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Obtener el rol del usuario desde la tabla users
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (userError || !user?.role) {
        router.push("/auth/login");
        return;
      }

      // Obtener permisos basados en el rol
      const { data: permissions, error: permError } = await supabase
        .from("role_permissions")
        .select(`
          permission_modules (
            name
          )
        `)
        .eq("role", user.role);
      if (permError || !permissions?.some((p: Permission) => p.permission_modules.some((module) => module.name === "dashboard_access"))) {
        router.push("/auth/login");
        return;
      }

      // Calcular fechas del periodo anterior
      const previousPeriod = {
        from: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1, 1) : undefined,
        to: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 0) : undefined,
      };

      // Cargar métricas
      try {
        // Órdenes activas
        const { data: activeOrders, error: ordersError } = await supabase
          .from("ordenes")
          .select("id")
          .neq("estado", "Entregado")
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");
        if (ordersError) throw ordersError;

        const { data: prevActiveOrders } = await supabase
          .from("ordenes")
          .select("id")
          .neq("estado", "Entregado")
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");

        // Ventas
        const { data: sales, error: salesError } = await supabase
          .from("ventas")
          .select("total")
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");
        if (salesError) throw salesError;

        const { data: prevSales } = await supabase
          .from("ventas")
          .select("total")
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");

        // Inventario
        const { data: inventory, error: inventoryError } = await supabase
          .from("inventario")
          .select("stock, stock_minimo");
        if (inventoryError) throw inventoryError;

        // Nuevos clientes (contact_requests)
        const { data: clients, error: clientsError } = await supabase
          .from("contact_requests")
          .select("id")
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");
        if (clientsError) throw clientsError;

        const { data: prevClients } = await supabase
          .from("contact_requests")
          .select("id")
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");

        // Calcular totales asegurando que no sea null
        const monthlySalesTotal = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
        const prevMonthlySalesTotal = prevSales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
        const lowStockCount = inventory?.filter((item: InventoryItem) => (item.stock || 0) <= (item.stock_minimo || 0)).length || 0;

        setMetrics({
          activeOrders: { current: activeOrders?.length || 0, previous: prevActiveOrders?.length || 0 },
          monthlySales: { current: monthlySalesTotal, previous: prevMonthlySalesTotal },
          stockItems: inventory?.length || 0,
          lowStockItems: lowStockCount,
          newClients: { current: clients?.length || 0, previous: prevClients?.length || 0 },
        });
        setLoading(false);
      } catch (err: any) {
        setError("Error al cargar las métricas: " + err.message);
        setLoading(false);
      }
    };

    fetchDataAndAuth();
  }, [router, dateRange]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <DashboardHeader />
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>
      <DashboardCards metrics={metrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders dateRange={dateRange} />
        <InventoryStatus />
      </div>
    </div>
  );
}