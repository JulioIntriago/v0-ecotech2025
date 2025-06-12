"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { DatePickerWithRange, DateRange } from "@/components/dashboard/date-range-picker";

// Definición de tipos para las respuestas de Supabase
interface Sale {
  monto_total: number | null;
}

interface InventoryItem {
  stock: number | null;
  stock_minimo: number | null;
}

// Definición de interfaces de props para los componentes
interface RecentOrdersProps {
  dateRange: DateRange | undefined;
  empresaId: number;
}

interface InventoryStatusProps {
  empresaId: number;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const empresaId = searchParams.get("empresa_id");

  // Estados para las métricas y el rango de fechas
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Validar que empresa_id esté presente
      if (!empresaId) {
        console.error("Falta el ID de la empresa en los parámetros.");
        toast({ title: "Error", description: "Falta el ID de la empresa.", variant: "destructive" });
        router.push("/auth/login");
        return;
      }

      // 2. Verificar la sesión del usuario (desactivado durante desarrollo)
      /*
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa.");
        router.push("/auth/login");
        return;
      }

      const { data: user, error: userError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", session.user.id)
        .single();
      if (userError || !user?.rol) {
        console.error("Error al verificar el rol del usuario:", userError);
        toast({ title: "Error", description: "No se pudo verificar el usuario.", variant: "destructive" });
        router.push("/auth/login");
        return;
      }
      */

      // 3. Calcular el periodo anterior para comparar métricas
      const previousPeriod = {
        from: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1, 1) : undefined,
        to: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 0) : undefined,
      };

      try {
        // 4. Obtener órdenes activas de la empresa
        const { data: activeOrders, error: ordersError } = await supabase
          .from("ordenes_trabajo")
          .select("id")
          .eq("empresa_id", parseInt(empresaId))
          .neq("estado", "completada")
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");
        if (ordersError) {
          console.error("Error al obtener órdenes activas:", ordersError);
          throw ordersError;
        }

        const { data: prevActiveOrders, error: prevOrdersError } = await supabase
          .from("ordenes_trabajo")
          .select("id")
          .eq("empresa_id", parseInt(empresaId))
          .neq("estado", "completada")
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");
        if (prevOrdersError) {
          console.error("Error al obtener órdenes activas del periodo anterior:", prevOrdersError);
          throw prevOrdersError;
        }

        // 5. Obtener ventas (facturas) de la empresa
        const { data: sales, error: salesError } = await supabase
          .from("facturas")
          .select("monto_total")
          .eq("empresa_id", parseInt(empresaId))
          .gte("fecha_emision", dateRange?.from?.toISOString() || "")
          .lte("fecha_emision", dateRange?.to?.toISOString() || "");
        if (salesError) {
          console.error("Error al obtener ventas:", salesError);
          throw salesError;
        }

        const { data: prevSales, error: prevSalesError } = await supabase
          .from("facturas")
          .select("monto_total")
          .eq("empresa_id", parseInt(empresaId))
          .gte("fecha_emision", previousPeriod.from?.toISOString() || "")
          .lte("fecha_emision", previousPeriod.to?.toISOString() || "");
        if (prevSalesError) {
          console.error("Error al obtener ventas del periodo anterior:", prevSalesError);
          throw prevSalesError;
        }

        // 6. Obtener inventario de la empresa
        const { data: inventory, error: inventoryError } = await supabase
          .from("productos")
          .select("stock, stock_minimo")
          .eq("empresa_id", parseInt(empresaId));
        if (inventoryError) {
          console.error("Error al obtener inventario:", inventoryError);
          throw inventoryError;
        }

        // 7. Obtener nuevos clientes de la empresa
        const { data: clients, error: clientsError } = await supabase
          .from("clientes")
          .select("id")
          .eq("empresa_id", parseInt(empresaId))
          .gte("created_at", dateRange?.from?.toISOString() || "")
          // Corrección: Cambiar "toId()" por "toISOString()"
          .lte("created_at", dateRange?.to?.toISOString() || "");
        if (clientsError) {
          console.error("Error al agregar clientes:", clientsError);
          throw clientsError;
        }

        const { data: prevClients, error: prevClientsError } = await supabase
          .from("clientes")
          .select("id")
          .eq("empresa_id", parseInt(empresaId))
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");
        if (prevClientsError) {
          console.error("Error al obtener clientes del periodo anterior:", prevClientsError);
          throw prevClientsError;
        }

        // 8. Calcular métricas
        const monthlySalesTotal = sales?.reduce((sum, sale) => sum + (sale.monto_total || 0), 0) || 0;
        const prevMonthlySalesTotal = prevSales?.reduce((sum, sale) => sum + (sale.monto_total || 0), 0) || 0;
        const lowStockItems = inventory?.filter((item: InventoryItem) => (item.stock || 0) <= (item.stock_minimo || 0)).length || 0;

        setMetrics({
          activeOrders: { current: activeOrders?.length || 0, previous: prevActiveOrders?.length || 0 },
          monthlySales: { current: monthlySalesTotal, previous: prevMonthlySalesTotal },
          stockItems: inventory?.length || 0,
          lowStockItems,
          newClients: { current: clients?.length || 0, previous: prevClients?.length || 0 },
        });

        console.log("Métricas cargadas para empresa_id:", empresaId, metrics);
        setLoading(false);
      } catch (err: any) {
        console.error("Error al cargar las métricas:", err);
        setError("Error al cargar las métricas: " + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [router, dateRange, empresaId]);

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
        {/* Corrección: Asegurar que RecentOrders acepte las props definidas en RecentOrdersProps */}
        <RecentOrders dateRange={dateRange} empresaId={parseInt(empresaId || "0")} />
        {/* Corrección: Asegurar que InventoryStatus acepte las props definidas en InventoryStatusProps */}
        <InventoryStatus empresaId={parseInt(empresaId || "0")} />
      </div>
    </div>
  );
}