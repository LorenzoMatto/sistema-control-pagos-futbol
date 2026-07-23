import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CalendarCheck } from "lucide-react";
import { checkAuth } from "@/app/actions/auth";
import EventosTable from "@/components/EventosTable";
import RenovarMetaModal from "@/components/RenovarMetaModal";

export const dynamic = "force-dynamic";

async function createEvento(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const descripcion = formData.get("descripcion") as string;
  const montoStr = formData.get("monto") as string;
  const tipoCalculo = formData.get("tipoCalculo") as string;
  
  if (descripcion && montoStr) {
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
          fecha: new Date(),
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
      asignaciones: true,
      pagos: true,
    }
  });

  // Detectar metas que deben renovarse (abiertas, del día anterior o anterior, y completadas)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const metasParaRenovar = isAdmin ? eventos
    .filter(e => {
      if (e.cerrado) return false;
      const fechaMeta = new Date(e.fecha);
      fechaMeta.setHours(0, 0, 0, 0);
      if (fechaMeta >= hoy) return false; // creada hoy, no aplica

      const totalEsperado = e.asignaciones.reduce((acc, a) => acc + a.monto, 0);
      const totalRecaudado = e.pagos.reduce((acc, p) => acc + p.monto, 0);
      return totalRecaudado >= totalEsperado && totalEsperado > 0;
    })
    .map(e => ({
      id: e.id,
      descripcion: e.descripcion,
      montoEsperado: e.montoEsperado,
      totalRecaudado: e.pagos.reduce((acc, p) => acc + p.monto, 0),
      totalEsperado: e.asignaciones.reduce((acc, a) => acc + a.monto, 0),
    })) : [];

  return (
    <div>
      {/* Modal de renovación — solo admin */}
      {isAdmin && metasParaRenovar.length > 0 && (
        <RenovarMetaModal metasCompletadas={metasParaRenovar} />
      )}

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
          <EventosTable eventos={eventos} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
