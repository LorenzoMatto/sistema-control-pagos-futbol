import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Receipt, Trash2 } from "lucide-react";
import { formatFecha, formatGuarani } from "@/lib/format";
import { checkAuth } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

async function createGasto(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const descripcion = formData.get("descripcion") as string;
  const montoStr = formData.get("monto") as string;
  
  if (descripcion && montoStr) {
    const monto = parseFloat(montoStr);
    if (!isNaN(monto) && monto > 0) {
      await prisma.gasto.create({
        data: { descripcion, monto },
      });
      revalidatePath("/gastos");
      revalidatePath("/"); // Actualizar dashboard
    }
  }
}

async function deleteGasto(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  if (id) {
    await prisma.gasto.delete({ where: { id } });
    revalidatePath("/gastos");
    revalidatePath("/");
  }
}

export default async function GastosPage() {
  const isAdmin = await checkAuth();
  const gastos = await prisma.gasto.findMany({
    orderBy: { fecha: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Fondo Común: Gastos
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Registra en qué se gasta el dinero del fondo
        </p>
      </div>

      <div className="page-grid-2">
        {/* Formulario */}
        {isAdmin && (
          <div className="glass-panel" style={{ padding: "1.5rem", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Receipt size={20} /> Registrar Egreso
            </h3>
            <form action={createGasto}>
              <div className="form-group">
                <label className="form-label">Descripción del gasto</label>
                <input type="text" name="descripcion" className="form-input" required placeholder="Ej: Pago alquiler cancha, compra de pelotas..." />
              </div>
              <div className="form-group">
                <label className="form-label">Monto (₲)</label>
                <input type="number" step="1000" min="1000" name="monto" className="form-input" required placeholder="Ej: 150000" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Registrar Gasto
              </button>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Historial de Gastos</h3>
          <div className="table-wrapper">
            <table className="table mobile-cards">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto (₲)</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {gastos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                      No se han registrado gastos del fondo aún.
                    </td>
                  </tr>
                ) : (
                  gastos.map((g) => (
                    <tr key={g.id}>
                      <td data-label="Fecha">
                        {formatFecha(g.fecha, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td data-label="Descripción" style={{ fontWeight: 500 }}>{g.descripcion}</td>
                      <td data-label="Monto (₲)" style={{ color: "var(--danger)" }}>
                        -{formatGuarani(g.monto)}
                      </td>
                      {isAdmin && (
                        <td data-label="Acción" style={{ textAlign: "right" }}>
                          <form action={deleteGasto} style={{ display: "inline-block" }}>
                            <input type="hidden" name="id" value={g.id} />
                            <button type="submit" className="btn btn-outline btn-icon" title="Eliminar (Revertir)">
                              <Trash2 size={16} color="var(--danger)" />
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
