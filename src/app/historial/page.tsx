import prisma from "@/lib/prisma";
import { History } from "lucide-react";
import { formatFecha, formatGuarani } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const pagos = await prisma.pago.findMany({
    include: { miembro: true, evento: true },
    orderBy: { fechaRegistro: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Historial Completo de Pagos
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Registro de todos los movimientos de ingresos
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <History size={20} /> Movimientos Registrados
        </h3>
        
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha de Registro</th>
                <th>Miembro</th>
                <th>Evento/Semana</th>
                <th>Monto (₲)</th>
              </tr>
            </thead>
            <tbody>
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No hay historial de pagos registrado.
                  </td>
                </tr>
              ) : (
                pagos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {formatFecha(p.fechaRegistro, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.miembro.nombre} {p.miembro.apodo ? `(${p.miembro.apodo})` : ""}</td>
                    <td>{p.evento.descripcion}</td>
                    <td style={{ color: "var(--success)" }}>+{formatGuarani(p.monto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
