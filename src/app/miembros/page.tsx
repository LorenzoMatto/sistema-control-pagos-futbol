import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserPlus } from "lucide-react";
import { checkAuth } from "@/app/actions/auth";
import MiembrosTable from "@/components/MiembrosTable";

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
    revalidatePath("/eventos/[id]", "page");
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
          <MiembrosTable miembros={miembros} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
