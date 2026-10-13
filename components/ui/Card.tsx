import React from "react";

interface CardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ id, children, className = "", hover = true, onClick }: CardProps) {
  return (
    <div
      id={id}
      className={`${hover ? "glass-card" : "glass-card-static"} p-5 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
