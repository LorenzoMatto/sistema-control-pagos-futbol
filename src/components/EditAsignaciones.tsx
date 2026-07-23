"use client";

import { useState } from "react";
import { formatGuarani } from "@/lib/format";
import { updateAsignacion } from "@/app/actions/eventos";

type Miembro = {
  id: string;
  nombre: string;
  apodo: string | null;
};

type Asignacion = {
  id: string;
  monto: number;
  miembro: Miembro;
};

export default function EditAsignaciones({ 
  asignaciones, 
  isAdmin 
}: { 
  asignaciones: Asignacion[]; 
  isAdmin: boolean 
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [montoEdit, setMontoEdit] = useState<string>("");

  const handleEdit = (id: string, currentMonto: number) => {
    setEditingId(id);
    setMontoEdit(currentMonto.toString());
  };

  const handleSave = async (id: string) => {
    const nuevoMonto = parseFloat(montoEdit);
    if (!isNaN(nuevoMonto) && nuevoMonto >= 0) {
      await updateAsignacion(id, nuevoMonto);
    }
    setEditingId(null);
  };

  return (
    <div className="table-wrapper">
      <table className="table mobile-cards">
        <thead>
          <tr>
            <th>Miembro</th>
            <th>Cuota Asignada (₲)</th>
            {isAdmin && <th style={{ textAlign: "right" }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((asig) => (
            <tr key={asig.id}>
              <td data-label="Miembro" style={{ fontWeight: 500 }}>
                {asig.miembro.nombre} {asig.miembro.apodo ? `(${asig.miembro.apodo})` : ""}
              </td>
              <td data-label="Cuota Asignada">
                {editingId === asig.id ? (
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={montoEdit}
                    onChange={(e) => setMontoEdit(e.target.value)}
                    className="form-input"
                    style={{ padding: "0.4rem", width: "150px" }}
                    autoFocus
                  />
                ) : (
                  formatGuarani(asig.monto)
                )}
              </td>
              {isAdmin && (
                <td data-label="Acciones" style={{ textAlign: "right" }}>
                  {editingId === asig.id ? (
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: "0.3rem 0.6rem" }}>
                        Cancelar
                      </button>
                      <button onClick={() => handleSave(asig.id)} className="btn btn-primary" style={{ padding: "0.3rem 0.6rem" }}>
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(asig.id, asig.monto)} className="btn btn-outline" style={{ padding: "0.3rem 0.6rem" }}>
                      Editar Cuota
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
