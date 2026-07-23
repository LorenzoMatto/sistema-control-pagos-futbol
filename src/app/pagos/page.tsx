import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Check, X, DollarSign } from "lucide-react";
import { formatGuarani } from "@/lib/format";
import { checkAuth } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

async function registrarPago(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const miembroId = formData.get("miembroId") as string;
  const eventoId = formData.get("eventoId") as string;
  const montoStr = formData.get("monto") as string;
  
  if (miembroId && eventoId && montoStr) {
    const monto = parseFloat(montoStr);
    if (!isNaN(monto) && monto > 0) {
      await prisma.pago.create({
        data: { miembroId, eventoId, monto },
      });
      revalidatePath("/pagos");
      revalidatePath("/");
    }
  }
}

async function revertirPago(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  if (id) {
    await prisma.pago.delete({ where: { id } });
    revalidatePath("/pagos");
    revalidatePath("/");
  }
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ eventoId?: string }>;
}) {
  const isAdmin = await checkAuth();
  const params = await searchParams;
  const eventos = await prisma.evento.findMany({
    orderBy: { fecha: "desc" },
    include: { asignaciones: true }
  });

  const selectedEventoId = params.eventoId || (eventos.length > 0 ? eventos[0].id : null);
  
  const selectedEvento = eventos.find(e => e.id === selectedEventoId);
  const miembros = await prisma.miembro.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  
  // Buscar pagos del evento seleccionado
  let pagos = [] as any[];
  if (selectedEventoId) {
    pagos = await prisma.pago.findMany({
      where: { eventoId: selectedEventoId },
      orderBy: { fechaRegistro: "desc" }
    });
  }

  // Agrupar pagos por miembro
  const pagosPorMiembro = new Map<string, any[]>();
  pagos.forEach(p => {
    if (!pagosPorMiembro.has(p.miembroId)) {
      pagosPorMiembro.set(p.miembroId, []);
    }
    pagosPorMiembro.get(p.miembroId)!.push(p);
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Control de Pagos
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Registra cobros parciales o totales de la meta fijada mensual
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-muted)" }}>Selecciona el Mes/Periodo</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {eventos.map(e => (
            <Link 
              key={e.id} 
              href={`/pagos?eventoId=${e.id}`}
              className={`badge ${e.id === selectedEventoId ? "badge-success" : "badge"}`}
              style={{ padding: "0.5rem 1rem", border: e.id === selectedEventoId ? "none" : "1px solid var(--border-color)", textDecoration: "none", color: e.id === selectedEventoId ? "var(--success)" : "var(--text-main)", background: e.id === selectedEventoId ? "var(--success-bg)" : "rgba(0,0,0,0.2)" }}
            >
              {e.descripcion}
            </Link>
          ))}
        </div>
      </div>

      {selectedEvento && (
        <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "4px solid var(--primary)" }}>
          <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Meta Activa (Cuotas Personalizadas)
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {miembros.map(m => {
              const asignacion = selectedEvento.asignaciones.find(a => a.miembroId === m.id);
              const cuotaEsperada = asignacion ? asignacion.monto : selectedEvento.montoEsperado;
              
              const pagosDelMiembro = pagosPorMiembro.get(m.id) || [];
              const totalAbonado = pagosDelMiembro.reduce((sum, p) => sum + p.monto, 0);
              const porcentaje = cuotaEsperada > 0 ? Math.min(100, Math.round((totalAbonado / cuotaEsperada) * 100)) : 100;
              const estaAlDia = totalAbonado >= cuotaEsperada;

              return (
                <div key={m.id} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "1rem" }}>
                    
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {m.nombre} {m.apodo ? `(${m.apodo})` : ""}
                        {estaAlDia && <span style={{ color: "var(--success)", fontSize: "0.8rem", background: "var(--success-bg)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>Al día</span>}
                      </span>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Abonado: <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{formatGuarani(totalAbonado)}</span> / {formatGuarani(cuotaEsperada)}
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <form action={registrarPago} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="hidden" name="miembroId" value={m.id} />
                        <input type="hidden" name="eventoId" value={selectedEvento.id} />
                        <input 
                          type="number" 
                          name="monto" 
                          placeholder="Monto a cobrar" 
                          min="0"
                          style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.3)", color: "white", width: "140px" }}
                          required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                          Cobrar
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden", marginBottom: "1rem" }}>
                    <div style={{ width: `${porcentaje}%`, height: "100%", background: estaAlDia ? "var(--success)" : "var(--primary)", transition: "width 0.3s ease" }}></div>
                  </div>

                  {/* Lista de pagos parciales */}
                  {pagosDelMiembro.length > 0 && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <p style={{ marginBottom: "0.25rem", fontWeight: 500 }}>Historial de aportes de este mes:</p>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {pagosDelMiembro.map(pago => (
                          <li key={pago.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.1)", padding: "0.3rem 0.5rem", borderRadius: "4px" }}>
                            <span>+ {formatGuarani(pago.monto)} <span style={{ opacity: 0.6 }}>({new Date(pago.fechaRegistro).toLocaleDateString()})</span></span>
                            {isAdmin && (
                              <form action={revertirPago}>
                                <input type="hidden" name="id" value={pago.id} />
                                <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.2rem" }} title="Revertir este pago">
                                  <X size={14} />
                                </button>
                              </form>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
