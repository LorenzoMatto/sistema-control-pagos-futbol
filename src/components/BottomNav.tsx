"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, Wallet, Receipt, Lock, Unlock, X } from "lucide-react";
import { login, logout, checkAuth } from "@/app/actions/auth";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/pagos", icon: Wallet, label: "Pagos" },
  { href: "/eventos", icon: CalendarCheck, label: "Metas" },
  { href: "/gastos", icon: Receipt, label: "Gastos" },
  { href: "/miembros", icon: Users, label: "Miembros" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
      setShowModal(false);
      setPassword("");
      setError("");
      // Recargar la página para actualizar los botones de admin
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
      {/* Modal de Login Admin */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel"
            style={{ padding: "2rem", width: "100%", maxWidth: "380px", borderRadius: "16px", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
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
                style={{
                  width: "100%", padding: "0.85rem 1rem",
                  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px", color: "white", fontSize: "1rem",
                  fontFamily: "inherit", marginBottom: "0.75rem", outline: "none",
                }}
              />
              {error && (
                <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Entrar como Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barra de navegación inferior */}
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

        {/* Botón Admin */}
        {isAdmin ? (
          <button className="bottom-nav-link" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--success)" }}>
            <Unlock size={22} />
            <span>Admin ✓</span>
          </button>
        ) : (
          <button className="bottom-nav-link" onClick={() => setShowModal(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Lock size={22} />
            <span>Admin</span>
          </button>
        )}
      </nav>
    </>
  );
}
