"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, Wallet, Receipt } from "lucide-react";

const navLinks = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/pagos", icon: Wallet, label: "Pagos" },
  { href: "/eventos", icon: CalendarCheck, label: "Eventos" },
  { href: "/gastos", icon: Receipt, label: "Gastos" },
  { href: "/miembros", icon: Users, label: "Miembros" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="bottom-nav">
      {navLinks.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`bottom-nav-link ${isActive(href) ? "active" : ""}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
