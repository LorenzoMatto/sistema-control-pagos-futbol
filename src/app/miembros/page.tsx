import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserPlus, UserX } from "lucide-react";
import { formatFecha } from "@/lib/format";
import { checkAuth } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

async function createMiembro(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const nombre = formData.get("nombre") as string;
  const apodo = formData.get("apodo") as string;
  
  if (nombre) {
    await prisma.miembro.create({
      data: { nombre, apodo: apodo || null },
    });
    revalidatePath("/miembros");
  }
}

async function disableMiembro(formData: FormData) {
  "use server";
  const { checkAuth } = await import("@/app/actions/auth");
  if (!(await checkAuth())) throw new Error("Unauthorized");
  
  const id = formData.get("id") as string;
  
  if (id) {
    await prisma.miembro.update({
      where: { id },
      data: { activo: false },
    });
    revalidatePath("/miembros");
  }
}

export default async function MiembrosPage() {
  const isAdmin = await checkAuth();
  const miembros = await prisma.miembro.findMany({
    where: { activo: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Gestión de Miembros
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Administra los jugadores activos en el fondo
        </p>
      </div>

      <div className="page-grid-2">
        {/* Formulario */}
        {isAdmin && (
          <div className="glass-panel" style={{ padding: "1.5rem", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserPlus size={20} /> Nuevo Miembro
            </h3>
            <form action={createMiembro}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input type="text" name="nombre" className="form-input" required placeholder="Ej: Lionel Messi" />
              </div>
              <div className="form-group">
                <label className="form-label">Apodo (Opcional)</label>
                <input type="text" name="apodo" className="form-input" placeholder="Ej: La Pulga" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Agregar Miembro
              </button>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Miembros Activos ({miembros.length})</h3>
          <div className="table-wrapper">
            <table className="table">
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
                  miembros.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.nombre}</td>
                      <td>{m.apodo ? <span className="badge badge-success">{m.apodo}</span> : "-"}</td>
                      <td>{formatFecha(m.creadoEn)}</td>
                      {isAdmin && (
                        <td style={{ textAlign: "right" }}>
                          <form action={disableMiembro} style={{ display: "inline-block" }}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" className="btn btn-outline btn-icon" title="Dar de baja">
                              <UserX size={16} color="var(--danger)" />
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
