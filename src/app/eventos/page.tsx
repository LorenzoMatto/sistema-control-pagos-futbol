import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CalendarCheck, Lock, Unlock } from "lucide-react";
import { formatFecha, formatGuarani } from "@/lib/format";
import { checkAuth } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

async function createEvento(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const descripcion = formData.get("descripcion") as string;
  const fechaStr = formData.get("fecha") as string;
  const montoStr = formData.get("montoEsperado") as string;
  
  if (descripcion && fechaStr && montoStr) {
    const montoEsperado = parseFloat(montoStr);
    if (!isNaN(montoEsperado) && montoEsperado > 0) {
      await prisma.evento.create({
        data: {
          descripcion,
          fecha: new Date(fechaStr),
          montoEsperado,
        },
      });
      revalidatePath("/eventos");
      revalidatePath("/pagos");
    }
  }
}

async function toggleCerrado(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");
  
  const id = formData.get("id") as string;
  const cerradoStr = formData.get("cerrado") as string;
  
  if (id) {
    const cerrado = cerradoStr === "true";
    await prisma.evento.update({
      where: { id },
      data: { cerrado: !cerrado },
    });
    revalidatePath("/eventos");
  }
}

export default async function EventosPage() {
  const isAdmin = await checkAuth();
  const eventos = await prisma.evento.findMany({
    orderBy: { fecha: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Semanas y Eventos
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Crea las cuotas semanales o partidos para el cobro
        </p>
      </div>

      <div className="page-grid-2">
        {/* Formulario */}
        {isAdmin && (
          <div className="glass-panel" style={{ padding: "1.5rem", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CalendarCheck size={20} /> Crear Semana/Evento
            </h3>
            <form action={createEvento}>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input type="text" name="descripcion" className="form-input" required placeholder="Ej: Semana 3 de Julio" />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Límite/Evento</label>
                <input type="date" name="fecha" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Monto de la Cuota (₲)</label>
                <input type="number" step="1000" min="1000" name="montoEsperado" className="form-input" required placeholder="Ej: 50000" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Crear Evento de Cobro
              </button>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Historial de Eventos</h3>
          <div className="table-wrapper">
            <table className="table mobile-cards">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Monto (₲)</th>
                  <th>Estado</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {eventos.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                      Aún no hay eventos/semanas configurados.
                    </td>
                  </tr>
                ) : (
                  eventos.map((e) => (
                    <tr key={e.id} style={{ opacity: e.cerrado ? 0.6 : 1 }}>
                      <td data-label="Descripción" style={{ fontWeight: 500 }}>{e.descripcion}</td>
                      <td data-label="Fecha">{formatFecha(e.fecha)}</td>
                      <td data-label="Monto (₲)">{formatGuarani(e.montoEsperado)}</td>
                      <td data-label="Estado">
                        <span className={`badge ${e.cerrado ? "badge-danger" : "badge-success"}`}>
                          {e.cerrado ? "Cerrado" : "Abierto"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td data-label="Acción" style={{ textAlign: "right" }}>
                          <form action={toggleCerrado} style={{ display: "inline-block" }}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="cerrado" value={String(e.cerrado)} />
                            <button type="submit" className="btn btn-outline btn-icon" title={e.cerrado ? "Reabrir" : "Cerrar"}>
                              {e.cerrado ? <Unlock size={16} /> : <Lock size={16} />}
                            </button>
                          </form>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
