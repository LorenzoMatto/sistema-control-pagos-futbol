import prisma from "@/lib/prisma";
import { formatGuarani } from "@/lib/format";
import { Wallet, TrendingUp, TrendingDown, Users } from "lucide-react";
import { BalancePieChart, EventosBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const pagosAgg = await prisma.pago.aggregate({ _sum: { monto: true } });
  const totalIngresos = pagosAgg._sum.monto || 0;

  const gastosAgg = await prisma.gasto.aggregate({ _sum: { monto: true } });
  const totalGastos = gastosAgg._sum.monto || 0;

  const saldoFondo = totalIngresos - totalGastos;
  const totalMiembros = await prisma.miembro.count({ where: { activo: true } });

  // Datos para el gráfico de barras: últimos 6 eventos/metas
  const ultimosEventos = await prisma.evento.findMany({
    take: 6,
    orderBy: { fecha: "desc" },
    include: { pagos: true, asignaciones: true },
  });

  const barData = ultimosEventos.reverse().map((e) => {
    const esperadoReal = e.asignaciones.length > 0 
      ? e.asignaciones.reduce((sum, a) => sum + a.monto, 0)
      : e.montoEsperado * totalMiembros;

    return {
      nombre: e.descripcion.length > 10 ? e.descripcion.slice(0, 10) + "…" : e.descripcion,
      esperado: esperadoReal,
      recaudado: e.pagos.reduce((sum, p) => sum + p.monto, 0),
    };
  });

  return (
    <div style={{ paddingBottom: "2rem" }}>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: "2rem", gridTemplateColumns: "1fr" }}>
        <StatCard
          icon={<Wallet size={28} />}
          color={saldoFondo < 0 ? "var(--danger)" : "var(--primary)"}
          bgColor={saldoFondo < 0 ? "var(--danger-bg)" : "rgba(59,130,246,0.1)"}
          label="Saldo del Fondo"
          value={formatGuarani(saldoFondo)}
          valueColor={saldoFondo < 0 ? "var(--danger)" : "var(--text-main)"}
        />
        <StatCard
          icon={<TrendingUp size={28} />}
          color="var(--success)"
          bgColor="var(--success-bg)"
          label="Total Ingresos"
          value={formatGuarani(totalIngresos)}
        />
        <StatCard
          icon={<TrendingDown size={28} />}
          color="var(--danger)"
          bgColor="var(--danger-bg)"
          label="Total Egresos"
          value={formatGuarani(totalGastos)}
        />
        <StatCard
          icon={<Users size={28} />}
          color="#94a3b8"
          bgColor="rgba(255,255,255,0.05)"
          label="Miembros Activos"
          value={String(totalMiembros)}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="glass-panel chart-item-small" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ color: "var(--text-main)", fontWeight: 600, fontSize: "1.1rem" }}>
              Distribución del Fondo
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Proporción de ingresos vs. egresos
            </p>
          </div>
          <BalancePieChart ingresos={totalIngresos} gastos={totalGastos} />
        </div>

        <div className="glass-panel chart-item-large" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ color: "var(--text-main)", fontWeight: 600, fontSize: "1.1rem" }}>
              Recaudación por Evento
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Comparativa de monto esperado vs. recaudado
            </p>
          </div>
          <EventosBarChart data={barData} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  color,
  bgColor,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="glass-panel stat-card">
      <div className="stat-icon" style={{ background: bgColor, color }}>
        {icon}
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value" style={{ color: valueColor || "var(--text-main)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
