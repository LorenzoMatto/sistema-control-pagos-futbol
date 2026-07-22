"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatGuarani } from "@/lib/format";

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

interface BalanceChartProps {
  ingresos: number;
  gastos: number;
}

interface EventoBarData {
  nombre: string;
  recaudado: number;
  esperado: number;
}

interface EventosChartProps {
  data: EventoBarData[];
}

// Tooltip personalizado para el Pie
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ color: payload[0].payload.fill, fontWeight: 600 }}>{payload[0].name}</p>
        <p style={{ color: "#f8fafc" }}>{formatGuarani(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// Tooltip personalizado para el Bar
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
        }}
      >
        <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatGuarani(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BalancePieChart({ ingresos, gastos }: BalanceChartProps) {
  const saldo = ingresos - gastos;
  const data = [
    { name: "Ingresos", value: ingresos, fill: "#10b981" },
    { name: "Gastos", value: gastos, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8" }}>
        Sin datos aún
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.5rem" }}>
        Saldo: <strong style={{ color: saldo >= 0 ? "#10b981" : "#ef4444" }}>{formatGuarani(saldo)}</strong>
      </p>
    </div>
  );
}

export function EventosBarChart({ data }: EventosChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "220px", color: "#94a3b8" }}>
        Sin eventos registrados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="nombre"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₲${(v / 1000).toFixed(0)}K`}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          formatter={(value) => <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{value}</span>}
        />
        <Bar dataKey="esperado" name="Esperado" fill="rgba(59,130,246,0.3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="recaudado" name="Recaudado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
