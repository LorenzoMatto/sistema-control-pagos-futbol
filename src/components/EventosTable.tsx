"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Pencil, Trash2, Check, X } from "lucide-react";
import { formatGuarani } from "@/lib/format";
import { deleteEvento, editEvento } from "@/app/actions/eventos";

type Asignacion = { id: string; monto: number };

type Evento = {
  id: string;
  descripcion: string;
  montoEsperado: number;
  cerrado: boolean;
  asignaciones: Asignacion[];
};

export default function EventosTable({
  eventos,
  isAdmin,
}: {
  eventos: Evento[];
  isAdmin: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEditOpen = (e: Evento) => {
    setEditingId(e.id);
    setEditDesc(e.descripcion);
    setEditMonto(e.montoEsperado.toString());
  };

  const handleEditSave = async (id: string) => {
    setLoading(true);
    await editEvento(id, editDesc, parseFloat(editMonto) || 0);
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteEvento(id);
    setDeletingId(null);
    setLoading(false);
  };

  return (
    <>
      {/* Modal de confirmación de eliminación */}
      {deletingId && (
        <div
          onClick={() => setDeletingId(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem"
          }}
        >
          <div
            className="glass-panel"
            style={{ padding: "2rem", maxWidth: "380px", width: "100%", borderTop: "4px solid var(--danger)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ padding: "0.6rem", background: "var(--danger-bg)", borderRadius: "10px", color: "var(--danger)" }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ margin: 0 }}>¿Eliminar esta Meta?</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Se eliminarán también todos los pagos asociados a esta meta. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeletingId(null)} className="btn btn-outline" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={loading}
                className="btn"
                style={{ flex: 1, background: "var(--danger)", color: "white" }}
              >
                {loading ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table mobile-cards">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Monto Total Esperado</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                  Aún no hay metas configuradas.
                </td>
              </tr>
            ) : (
              eventos.map((e) => {
                const totalEsperado =
                  e.asignaciones.reduce((acc, curr) => acc + curr.monto, 0) ||
                  e.montoEsperado * e.asignaciones.length;
                const isEditing = editingId === e.id;

                return (
                  <tr key={e.id} style={{ opacity: e.cerrado ? 0.6 : 1 }}>
                    <td data-label="Descripción" style={{ fontWeight: 500 }}>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editDesc}
                          onChange={(ev) => setEditDesc(ev.target.value)}
                          style={{ padding: "0.4rem", fontSize: "0.9rem" }}
                        />
                      ) : (
                        e.descripcion
                      )}
                    </td>
                    <td data-label="Monto Total">
                      {isEditing ? (
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          className="form-input"
                          value={editMonto}
                          onChange={(ev) => setEditMonto(ev.target.value)}
                          style={{ padding: "0.4rem", fontSize: "0.9rem", width: "140px" }}
                        />
                      ) : (
                        <>
                          {formatGuarani(totalEsperado)}
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Base indv: {formatGuarani(e.montoEsperado)}
                          </div>
                        </>
                      )}
                    </td>
                    <td data-label="Estado">
                      <span className={`badge ${e.cerrado ? "badge-danger" : "badge-success"}`}>
                        {e.cerrado ? "Cerrada" : "Abierta"}
                      </span>
                    </td>
                    <td
                      data-label="Acción"
                      style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.4rem", flexWrap: "wrap" }}
                    >
                      {/* Ver cuotas — para todos */}
                      <Link
                        href={`/eventos/${e.id}`}
                        className="btn btn-outline btn-icon"
                        title="Ver Cuotas por Miembro"
                      >
                        <Users size={16} />
                      </Link>

                      {isAdmin && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => setEditingId(null)}
                                className="btn btn-outline btn-icon"
                                title="Cancelar edición"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleEditSave(e.id)}
                                disabled={loading}
                                className="btn btn-icon"
                                title="Guardar"
                                style={{ background: "var(--success)", color: "white" }}
                              >
                                <Check size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditOpen(e)}
                                className="btn btn-outline btn-icon"
                                title="Editar Meta"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingId(e.id)}
                                className="btn btn-icon"
                                title="Eliminar Meta"
                                style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
