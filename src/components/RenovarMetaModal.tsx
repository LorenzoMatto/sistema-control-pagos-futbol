"use client";

import { useState } from "react";
import { RefreshCw, DollarSign, Check, X, Pencil } from "lucide-react";
import { renovarMeta } from "@/app/actions/eventos";
import { formatGuarani } from "@/lib/format";

type MetaCompletada = {
  id: string;
  descripcion: string;
  montoEsperado: number;
  totalRecaudado: number;
  totalEsperado: number;
};

export default function RenovarMetaModal({
  metasCompletadas,
}: {
  metasCompletadas: MetaCompletada[];
}) {
  const [visible, setVisible] = useState(true);
  const [metaActualIndex, setMetaActualIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [modoNuevoMonto, setModoNuevoMonto] = useState(false);

  if (!visible || metasCompletadas.length === 0) return null;

  const meta = metasCompletadas[metaActualIndex];

  const handleAceptar = async () => {
    setLoading(true);
    await renovarMeta(meta.id); // mismo monto
    setLoading(false);
    avanzarOCerrar();
  };

  const handleNuevoMonto = async () => {
    const monto = parseFloat(nuevoMonto.replace(/\./g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    setLoading(true);
    await renovarMeta(meta.id, monto);
    setLoading(false);
    avanzarOCerrar();
  };

  const avanzarOCerrar = () => {
    if (metaActualIndex < metasCompletadas.length - 1) {
      setMetaActualIndex(i => i + 1);
      setModoNuevoMonto(false);
      setNuevoMonto("");
    } else {
      setVisible(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: "2rem", maxWidth: "480px", width: "100%",
          borderTop: "4px solid var(--primary)",
          animation: "slideUp 0.3s ease"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.65rem", background: "rgba(59,130,246,0.15)", borderRadius: "12px", color: "var(--primary)" }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem" }}>¡Meta completada!</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {metasCompletadas.length > 1 && `${metaActualIndex + 1} de ${metasCompletadas.length} · `}
                Renovación de ciclo
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info de la meta */}
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{meta.descripcion}</p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>Recaudado</p>
              <p style={{ color: "var(--success)", fontWeight: 700, fontSize: "1.1rem" }}>{formatGuarani(meta.totalRecaudado)}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>Meta</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{formatGuarani(meta.totalEsperado)}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>Cuota base</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{formatGuarani(meta.montoEsperado)}</p>
            </div>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          ¿Cómo continuará el nuevo ciclo?
        </p>

        {modoNuevoMonto ? (
          <div>
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              Nuevo monto base por miembro (₲)
            </label>
            <input
              type="number"
              step="1000"
              min="1000"
              className="form-input"
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(e.target.value)}
              placeholder={`Actual: ${meta.montoEsperado}`}
              autoFocus
              style={{ marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setModoNuevoMonto(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Volver
              </button>
              <button
                onClick={handleNuevoMonto}
                disabled={loading || !nuevoMonto}
                className="btn btn-primary"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <DollarSign size={16} />
                {loading ? "Creando…" : "Crear con nuevo monto"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setModoNuevoMonto(true)}
              className="btn btn-outline"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Pencil size={16} />
              Nuevo Monto
            </button>
            <button
              onClick={handleAceptar}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Check size={16} />
              {loading ? "Renovando…" : "Aceptar (mismo monto)"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


