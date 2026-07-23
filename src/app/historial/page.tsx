import prisma from "@/lib/prisma";
import HistorialClient from "@/components/HistorialClient";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const pagos = await prisma.pago.findMany({
    include: { miembro: true, evento: true },
    orderBy: { fechaRegistro: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
          Historial Completo de Pagos
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Registro de todos los movimientos de ingresos
        </p>
      </div>

      <HistorialClient pagos={pagos} />
    </div>
  );
}
