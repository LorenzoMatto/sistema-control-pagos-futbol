"use client";

import Image from "next/image";

export default function TopHeader() {
  return (
    <header className="top-header">
      <div className="top-header-inner">
        {/* Logo izquierda */}
        <div className="top-header-logo">
          <Image
            src="/icon.png"
            alt="Futboleros"
            width={36}
            height={36}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* Texto central */}
        <div className="top-header-center">
          <span className="top-header-title">Futboleros</span>
          <span className="top-header-subtitle">Organiza · Controla · Cobra</span>
        </div>

        {/* Espacio derecho para balancear */}
        <div style={{ width: 36 }} />
      </div>
    </header>
  );
}
