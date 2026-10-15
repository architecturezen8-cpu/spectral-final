"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SamuraiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "dark" | "gold" | "ghost" | "light";
  as?: "button" | "a";
  href?: string;
}

const variantClass: Record<NonNullable<SamuraiButtonProps["variant"]>, string> = {
  dark: "samurai-btn",
  gold: "samurai-btn samurai-btn-gold",
  ghost: "samurai-btn samurai-btn-ghost",
  light: "samurai-btn samurai-btn-light",
};

export function SamuraiButton({
  children,
  variant = "dark",
  className,
  as = "button",
  href,
  ...props
}: SamuraiButtonProps) {
  const classes = cn(variantClass[variant], className);

  if (as === "a") {
    return (
      <a href={href} className={classes}>
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      <span>{children}</span>
    </button>
  );
}
