"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  History,
  Receipt,
  Menu,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { login, logout, checkAuth } from "@/app/actions/auth";
import { useEffect } from "react";

const navLinks = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/miembros", icon: Users, label: "Miembros" },
  { href: "/eventos", icon: CalendarCheck, label: "Semanas / Eventos" },
  { href: "/pagos", icon: Wallet, label: "Pagos y Faltas" },
  { href: "/gastos", icon: Receipt, label: "Gastos del Fondo" },
  { href: "/historial", icon: History, label: "Historial" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    checkAuth().then(setIsAdmin);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(password);
    if (res.success) {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword("");
      setError("");
    } else {
      setError(res.error || "Error");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAdmin(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Botón hamburguesa (solo visible en mobile) */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Overlay oscuro */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          {/* Logo */}
          <div className="sidebar-brand">
            <Image
              src="/icon.png"
              alt="Futboleros"
              width={36}
              height={36}
              style={{ objectFit: "contain" }}
            />
            <div>
              <h1>Futboleros</h1>
              <p>Organiza · Controla · Cobra</p>
            </div>
          </div>
          {/* Botón cerrar — solo visible en mobile */}
          <button
            onClick={() => setOpen(false)}
            className="sidebar-close-btn"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin Section */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {isAdmin ? (
            <button onClick={handleLogout} className="admin-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}>
              <Unlock size={16} /> Cerrar Sesión Admin
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="admin-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}>
              <Lock size={16} /> Admin
            </button>
          )}
        </div>
      </aside>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '400px', borderRadius: '16px', position: 'relative' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Acceso Admin</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Contraseña secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '15px' }}
                autoFocus
              />
              {error && <p style={{ color: '#ff6b6b', fontSize: '14px', marginTop: 0, marginBottom: '15px' }}>{error}</p>}
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
