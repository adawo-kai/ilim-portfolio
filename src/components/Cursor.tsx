"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer } from "@/lib/gsap";

/**
 * Two-part cursor: a precise dot and a lagging ring. Elements can ask for
 * a labelled state with data-cursor="Label" or hide the ring with
 * data-cursor="hide". Mouse only — touch devices keep native behaviour.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer()) return;
    const d = dot.current!, r = ring.current!, l = label.current!;
    document.documentElement.classList.add("has-cursor");

    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });

    let current: string | null = null;
    let shown = false;

    const setState = (state: string | null) => {
      if (state === current) return;
      current = state;
      if (state === "hide") {
        gsap.to(r, { scale: 0, duration: 0.4, ease: "expo.out" });
        gsap.to(d, { scale: 0, duration: 0.3 });
        return;
      }
      if (state === "link") {
        gsap.to(r, { scale: 1.9, backgroundColor: "rgba(236,234,228,0)", duration: 0.5, ease: "expo.out" });
        gsap.to(d, { scale: 0, duration: 0.3 });
        l.textContent = "";
        return;
      }
      if (state) {
        l.textContent = state;
        gsap.to(r, { scale: 3.6, backgroundColor: "rgba(236,234,228,1)", duration: 0.6, ease: "expo.out" });
        gsap.to(d, { scale: 0, duration: 0.3 });
        gsap.fromTo(l, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1 / 3.6, duration: 0.5, ease: "expo.out" });
      } else {
        gsap.to(r, { scale: 1, backgroundColor: "rgba(236,234,228,0)", duration: 0.5, ease: "expo.out" });
        gsap.to(d, { scale: 1, duration: 0.3 });
        gsap.to(l, { autoAlpha: 0, duration: 0.2 });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      last.x = e.clientX;
      last.y = e.clientY;
      resolve(e.target as Element | null);
    };
    const resolve = (el: Element | null) => {
      const target = el?.closest?.("[data-cursor], a, button");
      if (!target) return setState(null);
      setState(target.getAttribute("data-cursor") ?? "link");
    };
    // content moves under a still pointer while scrolling — re-check what is under it
    const last = { x: -1, y: -1 };
    const onScroll = () => {
      if (shown && last.x >= 0) resolve(document.elementFromPoint(last.x, last.y));
    };
    const onLeave = () => {
      shown = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(r, { scale: "-=0.25", duration: 0.2 });
    const onUp = () => {
      const s = current;
      current = "__";
      setState(s);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor-root pointer-events-none fixed inset-0 z-[95]" aria-hidden="true">
      <div
        ref={ring}
        className="invisible fixed top-0 left-0 grid h-9 w-9 place-items-center rounded-full border border-paper/60 mix-blend-difference"
      >
        <span ref={label} className="label invisible whitespace-nowrap text-ink">
          &nbsp;
        </span>
      </div>
      <div ref={dot} className="invisible fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-paper mix-blend-difference" />
    </div>
  );
}
