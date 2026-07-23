import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import DesktopSidebar from "@/components/DesktopSidebar";
import RenovarMetaModal from "@/components/RenovarMetaModal";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Fondo Fútbol — Gestión de Pagos",
  description: "Sistema de control de pagos y fondo común para el grupo de fútbol",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0f19",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Solo calcular metas a renovar para admins
  const isAdmin = await checkAuth();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const metasParaRenovar = isAdmin
    ? await (async () => {
        const eventos = await prisma.evento.findMany({
          where: { cerrado: false },
          include: { asignaciones: true, pagos: true },
        });

        return eventos
          .filter(e => {
            const fechaMeta = new Date(e.fecha);
            fechaMeta.setHours(0, 0, 0, 0);
            if (fechaMeta >= hoy) return false;

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
          }));
      })()
    : [];

  return (
    <html lang="es">
      <body>
        {/* Modal de renovación de ciclo — solo para admins */}
        {isAdmin && metasParaRenovar.length > 0 && (
          <RenovarMetaModal metasCompletadas={metasParaRenovar} />
        )}

        <div className="app-shell">
          {/* Sidebar solo en desktop */}
          <DesktopSidebar />

          {/* Zona derecha: header móvil + contenido + bottom nav */}
          <div className="content-area">
            {/* Header solo en móvil */}
            <TopHeader />

            {/* Contenido principal */}
            <main className="main-content">
              <div className="main-panel">{children}</div>
            </main>

            {/* Bottom Navigation solo en móvil */}
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
