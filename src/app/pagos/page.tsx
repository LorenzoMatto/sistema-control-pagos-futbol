import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Check, X } from "lucide-react";
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
    try {
      await prisma.pago.create({
        data: { miembroId, eventoId, monto },
      });
      revalidatePath("/pagos");
      revalidatePath("/");
    } catch (e) {
      // Ignorar duplicados silenciosamente para este MVP o manejar error
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
  });

  const selectedEventoId = params.eventoId || (eventos.length > 0 ? eventos[0].id : null);
  
  const selectedEvento = eventos.find(e => e.id === selectedEventoId);
  const miembros = await prisma.miembro.findMany({ where: { activo: true } });
  
  // Buscar pagos del evento seleccionado
  let pagos = [] as any[];
  if (selectedEventoId) {
    pagos = await prisma.pago.findMany({
      where: { eventoId: selectedEventoId },
    });
  }

  // Estructuras de datos
  const paidMemberIds = new Set(pagos.map(p => p.miembroId));
  const pagosPorMiembro = new Map(pagos.map(p => [p.miembroId, p]));

  const pagados = miembros.filter(m => paidMemberIds.has(m.id));
  const noPagados = miembros.filter(m => !paidMemberIds.has(m.id));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Control de Pagos y Faltas
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Registra quién pagó y quién está en falta por evento
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-muted)" }}>Selecciona el Evento/Semana</h3>
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
        <div className="page-grid-equal">
          
          {/* Faltas (No Pagados) */}
          <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "4px solid var(--danger)" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--danger)" }}>Faltas de Pago ({noPagados.length})</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {noPagados.map(m => (
                <li key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontWeight: 500 }}>{m.nombre} {m.apodo ? `(${m.apodo})` : ""}</span>
                  
                  {isAdmin && (
                    <form action={registrarPago}>
                      <input type="hidden" name="miembroId" value={m.id} />
                      <input type="hidden" name="eventoId" value={selectedEvento.id} />
                      <input type="hidden" name="monto" value={selectedEvento.montoEsperado} />
                      <button type="submit" className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--success)", borderColor: "var(--success)" }}>
                        <Check size={16} /> Marcar Pagado
                      </button>
                    </form>
                  )}
                </li>
              ))}
              {noPagados.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Todos están al día en este evento.</p>
              )}
            </ul>
          </div>

          {/* Pagados */}
          <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "4px solid var(--success)" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--success)" }}>Pagados ({pagados.length})</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {pagados.map(m => {
                const pago = pagosPorMiembro.get(m.id);
                return (
                  <li key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <span style={{ fontWeight: 500, display: "block" }}>{m.nombre}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>Pagó {formatGuarani(pago?.monto)}</span>
                    </div>
                    
                    {isAdmin && (
                      <form action={revertirPago}>
                        <input type="hidden" name="id" value={pago?.id} />
                        <button type="submit" className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--danger)", borderColor: "var(--danger)" }}>
                          <X size={16} /> Revertir
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
              {pagados.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nadie ha pagado este evento todavía.</p>
              )}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
