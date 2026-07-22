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

  // Datos para el gráfico de barras: últimos 6 eventos
  const ultimosEventos = await prisma.evento.findMany({
    take: 6,
    orderBy: { fecha: "desc" },
    include: { pagos: true },
  });

  const barData = ultimosEventos.reverse().map((e) => ({
    nombre: e.descripcion.length > 10 ? e.descripcion.slice(0, 10) + "…" : e.descripcion,
    esperado: e.montoEsperado * totalMiembros,
    recaudado: e.pagos.reduce((sum, p) => sum + p.monto, 0),
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Panel General
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Resumen financiero del fondo del grupo
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
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
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85rem" }}>
            Distribución del Fondo
          </h3>
          <BalancePieChart ingresos={totalIngresos} gastos={totalGastos} />
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85rem" }}>
            Recaudación por Evento
          </h3>
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
