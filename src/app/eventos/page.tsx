import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CalendarCheck, Lock, Unlock, Users } from "lucide-react";
import { formatFecha, formatGuarani } from "@/lib/format";
import { checkAuth } from "@/app/actions/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function createEvento(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const descripcion = formData.get("descripcion") as string;
  const fechaStr = formData.get("fecha") as string;
  const montoStr = formData.get("monto") as string;
  const tipoCalculo = formData.get("tipoCalculo") as string;
  
  if (descripcion && fechaStr && montoStr) {
    const montoInput = parseFloat(montoStr);
    if (!isNaN(montoInput) && montoInput > 0) {
      
      const miembrosActivos = await prisma.miembro.findMany({ where: { activo: true } });
      let montoIndividual = 0;
      
      if (miembrosActivos.length > 0) {
        if (tipoCalculo === "fijo") {
          montoIndividual = montoInput;
        } else {
          montoIndividual = montoInput / miembrosActivos.length;
        }
      }

      await prisma.evento.create({
        data: {
          descripcion,
          fecha: new Date(fechaStr),
          montoEsperado: montoIndividual,
          asignaciones: {
            create: miembrosActivos.map(m => ({
              miembroId: m.id,
              monto: montoIndividual
            }))
          }
        },
      });
      revalidatePath("/eventos");
      revalidatePath("/pagos");
      revalidatePath("/");
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
    revalidatePath("/pagos");
  }
}

export default async function EventosPage() {
  const isAdmin = await checkAuth();
  
  const eventos = await prisma.evento.findMany({
    orderBy: { fecha: "desc" },
    include: {
      asignaciones: true
    }
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Metas de Recaudación
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Crea metas globales o cuotas mensuales
        </p>
      </div>

      <div className="page-grid-2">
        {/* Formulario */}
        {isAdmin && (
          <div className="glass-panel" style={{ padding: "1.5rem", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CalendarCheck size={20} /> Crear Nueva Meta
            </h3>
            <form action={createEvento}>
              <div className="form-group">
                <label className="form-label">Descripción del Mes/Meta</label>
                <input type="text" name="descripcion" className="form-input" required placeholder="Ej: Meta Agosto 2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Límite</label>
                <input type="date" name="fecha" className="form-input" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tipo de Cálculo</label>
                <select name="tipoCalculo" className="form-input" required>
                  <option value="fijo">Monto fijo por cada miembro</option>
                  <option value="global">Meta global (se divide entre miembros)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto (₲)</label>
                <input type="number" step="1000" min="1000" name="monto" className="form-input" required placeholder="Ej: 200000" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                Crear Meta
              </button>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Historial de Metas</h3>
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
                    const totalEsperado = e.asignaciones.reduce((acc, curr) => acc + curr.monto, 0) || (e.montoEsperado * e.asignaciones.length);
                    
                    return (
                      <tr key={e.id} style={{ opacity: e.cerrado ? 0.6 : 1 }}>
                        <td data-label="Descripción" style={{ fontWeight: 500 }}>
                          {e.descripcion}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatFecha(e.fecha)}
                          </div>
                        </td>
                        <td data-label="Monto Total">
                          {formatGuarani(totalEsperado)}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Base indv: {formatGuarani(e.montoEsperado)}
                          </div>
                        </td>
                        <td data-label="Estado">
                          <span className={`badge ${e.cerrado ? "badge-danger" : "badge-success"}`}>
                            {e.cerrado ? "Cerrada" : "Abierta"}
                          </span>
                        </td>
                        <td data-label="Acción" style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          {isAdmin && (
                            <>
                              <Link href={`/eventos/${e.id}`} className="btn btn-outline btn-icon" title="Ver/Editar Cuotas por Miembro">
                                <Users size={16} />
                              </Link>
                              <form action={toggleCerrado}>
                                <input type="hidden" name="id" value={e.id} />
                                <input type="hidden" name="cerrado" value={String(e.cerrado)} />
                                <button type="submit" className="btn btn-outline btn-icon" title={e.cerrado ? "Reabrir" : "Cerrar"}>
                                  {e.cerrado ? <Unlock size={16} /> : <Lock size={16} />}
                                </button>
                              </form>
                            </>
                          )}
                          {!isAdmin && (
                            <Link href={`/eventos/${e.id}`} className="btn btn-outline btn-icon" title="Ver Cuotas">
                              <Users size={16} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
