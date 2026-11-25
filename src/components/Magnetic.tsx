"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";

/** Pulls its child toward the pointer; the inner layer moves further for depth. */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current, child = inner.current;
    if (!el || !child || !isFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "elastic.out(1, 0.4)" });
    const cxTo = gsap.quickTo(child, "x", { duration: 0.9, ease: "elastic.out(1, 0.4)" });
    const cyTo = gsap.quickTo(child, "y", { duration: 0.9, ease: "elastic.out(1, 0.4)" });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      xTo(x * strength);
      yTo(y * strength);
      cxTo(x * strength * 0.45);
      cyTo(y * strength * 0.45);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      cxTo(0);
      cyTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <div ref={outer} className={`inline-block ${className}`}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
