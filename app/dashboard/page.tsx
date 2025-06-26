"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { DatePickerWithRange, DateRange } from "@/components/dashboard/date-range-picker";

import { useEmpresa } from "@/app/context/empresa-context"; // ✅ importante

interface Sale {
  monto_total: number | null;
}

interface InventoryItem {
  stock: number | null;
  stock_minimo: number | null;
}

export default function DashboardPage() {
  const { empresaId } = useEmpresa();
  const router = useRouter();

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

      if (!empresaId) {
        console.log("Esperando a que el empresaId esté disponible...");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa.");
        router.push("/auth/login");
        return;
      }

      const { data: user, error: userError } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userError || !user?.role) {
        console.error("Error al verificar el role del usuario:", userError);
        toast({ title: "Error", description: "No se pudo verificar el usuario.", variant: "destructive" });
        router.push("/auth/login");
        return;
      }

      const previousPeriod = {
        from: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1, 1) : undefined,
        to: dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 0) : undefined,
      };

      try {
        const { data: activeOrders } = await supabase
          .from("ordenes_trabajo")
          .select("id")
          .eq("empresa_id", empresaId)
          .neq("estado", "completada")
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");

        const { data: prevActiveOrders } = await supabase
          .from("ordenes_trabajo")
          .select("id")
          .eq("empresa_id", empresaId)
          .neq("estado", "completada")
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");

        const { data: sales } = await supabase
          .from("facturas")
          .select("monto_total")
          .eq("empresa_id", empresaId)
          .gte("fecha_emision", dateRange?.from?.toISOString() || "")
          .lte("fecha_emision", dateRange?.to?.toISOString() || "");

        const { data: prevSales } = await supabase
          .from("facturas")
          .select("monto_total")
          .eq("empresa_id", empresaId)
          .gte("fecha_emision", previousPeriod.from?.toISOString() || "")
          .lte("fecha_emision", previousPeriod.to?.toISOString() || "");

        const { data: inventory } = await supabase
          .from("productos")
          .select("stock, stock_minimo")
          .eq("empresa_id", empresaId);

        const { data: clients } = await supabase
          .from("clientes")
          .select("id")
          .eq("empresa_id", empresaId)
          .gte("created_at", dateRange?.from?.toISOString() || "")
          .lte("created_at", dateRange?.to?.toISOString() || "");

        const { data: prevClients } = await supabase
          .from("clientes")
          .select("id")
          .eq("empresa_id", empresaId)
          .gte("created_at", previousPeriod.from?.toISOString() || "")
          .lte("created_at", previousPeriod.to?.toISOString() || "");

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
      </div>
      <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      <DashboardCards metrics={metrics} />
      {empresaId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentOrders dateRange={dateRange} empresaId={empresaId} />
          <InventoryStatus empresaId={empresaId} />
        </div>
      )}
    </div>
  );
}
