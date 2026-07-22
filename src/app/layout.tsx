import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, CalendarCheck, Wallet, History, Receipt, Menu } from "lucide-react";
import MobileSidebar from "@/components/MobileSidebar";

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

const navLinks = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/miembros", icon: "users", label: "Miembros" },
  { href: "/eventos", icon: "calendar", label: "Semanas / Eventos" },
  { href: "/pagos", icon: "wallet", label: "Pagos y Faltas" },
  { href: "/gastos", icon: "receipt", label: "Gastos del Fondo" },
  { href: "/historial", icon: "history", label: "Historial" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          {/* Mobile Sidebar (client component) */}
          <MobileSidebar />

          {/* Main content */}
          <main className="main-content">
            <div className="glass-panel main-panel">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
