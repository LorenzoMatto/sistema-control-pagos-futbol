import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import DesktopSidebar from "@/components/DesktopSidebar";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
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
