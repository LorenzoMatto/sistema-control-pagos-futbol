"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { formatFecha, formatGuarani } from "@/lib/format";

type PagoConRelaciones = {
  id: string;
  monto: number;
  fechaRegistro: Date;
  miembro: { id: string; nombre: string; apodo: string | null };
  evento: { id: string; descripcion: string };
};

export default function HistorialClient({ pagos }: { pagos: PagoConRelaciones[] }) {
  const [miembroFiltro, setMiembroFiltro] = useState<string>("Todos");
  const [eventoFiltro, setEventoFiltro] = useState<string>("Todos");

  // Obtener valores únicos para los selects
  const miembrosUnicos = Array.from(new Set(pagos.map(p => p.miembro.id)))
    .map(id => pagos.find(p => p.miembro.id === id)?.miembro)
    .filter(Boolean)
    .sort((a, b) => a!.nombre.localeCompare(b!.nombre));

  const eventosUnicos = Array.from(new Set(pagos.map(p => p.evento.id)))
    .map(id => pagos.find(p => p.evento.id === id)?.evento)
    .filter(Boolean);

  // Filtrar pagos
  const pagosFiltrados = pagos.filter(p => {
    const matchMiembro = miembroFiltro === "Todos" || p.miembro.id === miembroFiltro;
    const matchEvento = eventoFiltro === "Todos" || p.evento.id === eventoFiltro;
    return matchMiembro && matchEvento;
  });

  return (
    <div className="glass-panel" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <History size={20} /> Movimientos Registrados
        </h3>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select 
            value={miembroFiltro} 
            onChange={(e) => setMiembroFiltro(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.3)", color: "white", outline: "none", fontSize: "0.85rem" }}
          >
            <option value="Todos">Todos los miembros</option>
            {miembrosUnicos.map(m => m && (
              <option key={m.id} value={m.id}>{m.nombre} {m.apodo ? `(${m.apodo})` : ""}</option>
            ))}
          </select>

          <select 
            value={eventoFiltro} 
            onChange={(e) => setEventoFiltro(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.3)", color: "white", outline: "none", fontSize: "0.85rem" }}
          >
            <option value="Todos">Todos los meses/eventos</option>
            {eventosUnicos.map(e => e && (
              <option key={e.id} value={e.id}>{e.descripcion}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="table mobile-cards">
          <thead>
            <tr>
              <th>Fecha de Registro</th>
              <th>Miembro</th>
              <th>Mes/Periodo</th>
              <th>Monto (₲)</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                  No hay pagos registrados que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              pagosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td data-label="Fecha de Registro">
                    {formatFecha(p.fechaRegistro, { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td data-label="Miembro" style={{ fontWeight: 500 }}>{p.miembro.nombre} {p.miembro.apodo ? `(${p.miembro.apodo})` : ""}</td>
                  <td data-label="Mes/Periodo">{p.evento.descripcion}</td>
                  <td data-label="Monto (₲)" style={{ color: "var(--success)" }}>+{formatGuarani(p.monto)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
