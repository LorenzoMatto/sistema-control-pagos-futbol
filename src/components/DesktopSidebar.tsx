"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, Wallet, Receipt, History, Lock, Unlock, X } from "lucide-react";
import { login, logout, checkAuth } from "@/app/actions/auth";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pagos", icon: Wallet, label: "Pagos y Faltas" },
  { href: "/eventos", icon: CalendarCheck, label: "Semanas / Eventos" },
  { href: "/gastos", icon: Receipt, label: "Gastos del Fondo" },
  { href: "/miembros", icon: Users, label: "Miembros" },
  { href: "/historial", icon: History, label: "Historial" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth().then(setIsAdmin);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(password);
    if (res.success) {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword("");
      setError("");
      window.location.reload();
    } else {
      setError(res.error || "Contraseña incorrecta");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAdmin(false);
    window.location.reload();
  };

  return (
    <>
      <aside className="sidebar glass-panel">
        {/* Logo y nombre */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Image
              src="/icon.png"
              alt="Futboleros"
              width={52}
              height={52}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
            />
            <div>
              <h1>Futboleros</h1>
              <p>Organiza · Controla · Cobra</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(href) ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin */}
        <div className="sidebar-footer">
          {isAdmin ? (
            <button onClick={handleLogout} className="admin-btn admin-btn-active">
              <Unlock size={16} /> Cerrar Sesión Admin
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="admin-btn">
              <Lock size={16} /> Acceso Admin
            </button>
          )}
        </div>
      </aside>

      {/* Modal Login */}
      {showLogin && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setShowLogin(false)}
        >
          <div
            className="glass-panel"
            style={{ padding: "2rem", width: "100%", maxWidth: "380px", borderRadius: "16px", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowLogin(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "0.6rem", background: "rgba(59,130,246,0.15)", borderRadius: "10px", color: "var(--primary)" }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Acceso Admin</h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Ingresa para registrar cambios</p>
              </div>
            </div>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Contraseña secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "white", fontSize: "1rem", fontFamily: "inherit", marginBottom: "0.75rem", outline: "none" }}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Entrar como Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
