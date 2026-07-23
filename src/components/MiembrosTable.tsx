"use client";

import { useState } from "react";
import { UserX, Pencil, Trash2, Check, X } from "lucide-react";
import { formatFecha } from "@/lib/format";
import { editMiembro, disableMiembro, deleteMiembro } from "@/app/actions/miembros";

type Miembro = {
  id: string;
  nombre: string;
  apodo: string | null;
  creadoEn: Date;
  activo: boolean;
};

export default function MiembrosTable({
  miembros,
  isAdmin,
}: {
  miembros: Miembro[];
  isAdmin: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editApodo, setEditApodo] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEditOpen = (m: Miembro) => {
    setEditingId(m.id);
    setEditNombre(m.nombre);
    setEditApodo(m.apodo || "");
  };

  const handleEditSave = async (id: string) => {
    setLoading(true);
    await editMiembro(id, editNombre, editApodo);
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteMiembro(id);
    setDeletingId(null);
    setLoading(false);
  };

  const handleDisable = async (id: string) => {
    setLoading(true);
    await disableMiembro(id);
    setLoading(false);
  };

  return (
    <>
      {/* Modal de Confirmación de Eliminación Definitiva */}
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
              <h3 style={{ margin: 0 }}>¿Eliminar este miembro?</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Si lo eliminas definitivamente, se borrarán todos sus pagos y registros históricos. Si solo quieres que deje de aparecer, usa "Dar de baja" (Suspender).
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
              <th>Nombre</th>
              <th>Apodo</th>
              <th>Fecha de Ingreso</th>
              {isAdmin && <th style={{ textAlign: "right" }}>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {miembros.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                  No hay miembros registrados aún.
                </td>
              </tr>
            ) : (
              miembros.map((m) => {
                const isEditing = editingId === m.id;

                return (
                  <tr key={m.id}>
                    <td data-label="Nombre" style={{ fontWeight: 500 }}>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editNombre}
                          onChange={(ev) => setEditNombre(ev.target.value)}
                          style={{ padding: "0.4rem", fontSize: "0.9rem" }}
                          placeholder="Nombre"
                        />
                      ) : (
                        m.nombre
                      )}
                    </td>
                    <td data-label="Apodo">
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editApodo}
                          onChange={(ev) => setEditApodo(ev.target.value)}
                          style={{ padding: "0.4rem", fontSize: "0.9rem", width: "120px" }}
                          placeholder="Apodo"
                        />
                      ) : m.apodo ? (
                        <span className="badge badge-success">{m.apodo}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td data-label="Fecha de Ingreso">{formatFecha(m.creadoEn)}</td>
                    
                    {isAdmin && (
                      <td
                        data-label="Acción"
                        style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.4rem", flexWrap: "wrap" }}
                      >
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
                              onClick={() => handleEditSave(m.id)}
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
                              onClick={() => handleEditOpen(m)}
                              className="btn btn-outline btn-icon"
                              title="Editar Miembro"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDisable(m.id)}
                              disabled={loading}
                              className="btn btn-outline btn-icon"
                              title="Dar de baja (Suspender)"
                            >
                              <UserX size={16} color="var(--primary)" />
                            </button>
                            <button
                              onClick={() => setDeletingId(m.id)}
                              className="btn btn-icon"
                              title="Eliminar permanentemente"
                              style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
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
