import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { checkAuth } from "@/app/actions/auth";
import EditAsignaciones from "@/components/EditAsignaciones";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = await checkAuth();
  
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      asignaciones: {
        include: { miembro: true },
        orderBy: { miembro: { nombre: 'asc' } }
      }
    }
  });

  if (!evento) return notFound();

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link href="/eventos" className="btn btn-outline btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
            Detalle de Cuotas: {evento.descripcion}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Asignaciones individuales para esta meta
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={20} /> Lista de Miembros y Cuotas
        </h3>
        {evento.asignaciones.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No hay asignaciones para esta meta.</p>
        ) : (
          <EditAsignaciones asignaciones={evento.asignaciones} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}
