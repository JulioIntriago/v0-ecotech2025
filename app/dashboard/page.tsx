"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { InventoryStatus } from "@/components/dashboard/inventory-status";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    activeOrders: 0,
    monthlySales: 0,
    stockItems: 0,
    lowStockItems: 0,
    newClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDataAndAuth = async () => {
      // Verificar autenticación solo en producción
      if (process.env.NODE_ENV !== "development") {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session:", session); // Depuración
        if (!session) {
          router.push("/auth/login");
          return;
        }

        // Obtener rol del usuario
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (userError || !userData) {
          console.error("Error fetching user data:", userError);
          router.push("/auth/login");
          return;
        }
        console.log("User role:", userData.role); // Depuración
      }

      // Cargar métricas (sin verificaciones de permisos en desarrollo)
      try {
        const { data: orders, error: ordersError } = await supabase
          .from("ordenes")
          .select("id")
          .neq("estado", "Entregado");
        if (ordersError) throw ordersError;

        const { data: sales, error: salesError } = await supabase
          .from("ventas")
          .select("total")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        if (salesError) throw salesError;

        const { data: inventory, error: inventoryError } = await supabase
          .from("inventario")
          .select("stock, stock_minimo");
        if (inventoryError) throw inventoryError;

        const { data: clients, error: clientsError } = await supabase
          .from("contact_requests")
          .select("id")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        if (clientsError) throw clientsError;

        const monthlySalesTotal = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const lowStockCount = inventory.filter(item => (item.stock || 0) <= (item.stock_minimo || 0)).length;

        setMetrics({
          activeOrders: orders?.length || 0,
          monthlySales: monthlySalesTotal,
          stockItems: inventory.length,
          lowStockItems: lowStockCount,
          newClients: clients?.length || 0,
        });
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching metrics:", err);
        setError("Error al cargar las métricas: " + err.message);
        setLoading(false);
      }
    };

    fetchDataAndAuth();
  }, [router]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <DashboardCards metrics={metrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders />
        <InventoryStatus />
      </div>
    </div>
  );
}