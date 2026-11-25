"use client";

import { useRef, useState } from "react";
import { gsap, isFinePointer, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import AsciiPreview from "./AsciiPreview";
import { Accent, useDict } from "./I18n";
import SectionHead from "./SectionHead";

function Toolkit() {
  const t = useDict().focus;
  return (
    <div className="px-gutter mt-24 md:mt-32">
      <div className="grid grid-cols-12 items-end gap-x-4">
        <p data-reveal="fade" className="label col-span-12 text-paper-dim md:col-span-3">
          {t.toolkitLabel}
        </p>
        <h3
          data-reveal="lines"
          className="col-span-12 mt-4 text-[clamp(30px,3.6vw,58px)] leading-[1] font-[350] tracking-[-0.03em] md:col-span-9 md:mt-0"
        >
          <Accent parts={t.toolkitTitle} />
        </h3>
      </div>

      <dl className="mt-10 border-t border-line md:mt-14">
        {t.groups.map((g, i) => (
          <div key={g.name} data-reveal="fade" className="grid grid-cols-12 gap-x-4 border-b border-line py-5 md:py-6">
            <dt className="label col-span-12 flex gap-3 pt-1.5 text-paper-dim md:col-span-3">
              <span className="text-accent">0{i + 1}</span>
              {g.name}
            </dt>
            <dd className="col-span-12 mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-1 md:col-span-9 md:mt-0">
              {g.items.map((item, j) => {
                const home = g.home?.includes(item);
                return (
                  <span key={item} className="flex items-baseline">
                    <span
                      className={`text-[clamp(19px,1.9vw,30px)] leading-tight tracking-[-0.015em] transition-[color,font-variation-settings] duration-300 hover:text-accent hover:[font-variation-settings:'wght'_700,'wdth'_100] ${
                        home ? "font-[650] text-paper" : "font-[330] text-paper/85"
                      }`}
                    >
                      {item}
                    </span>
                    {home && j === Math.max(...(g.home ?? []).map((h) => g.items.indexOf(h))) ? (
                      <sup className="serif ml-1.5 text-[15px] text-accent italic">{t.homeBase}</sup>
                    ) : null}
                    {j < g.items.length - 1 ? <span className="mx-2 text-paper-faint">/</span> : null}
                  </span>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Disciplines() {
  const { focus: t, lang } = useDict();
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // floating preview that trails the cursor and leans with its velocity
  useIsoLayoutEffect(() => {
    const el = root.current, p = panel.current;
    if (!el || !p || !isFinePointer()) return;
    gsap.set(p, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
    const xTo = gsap.quickTo(p, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(p, "y", { duration: 0.7, ease: "power3" });
    const rTo = gsap.quickTo(p, "rotation", { duration: 0.9, ease: "power3" });
    const list = el.querySelector<HTMLElement>("[data-list]")!;
    const pointer = { x: -1, y: -1, lastX: 0 };
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    // follow in list space every frame, so the panel also tracks while the page scrolls
    const tick = () => {
      if (pointer.x < 0) return;
      const r = list.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      xTo(pointer.x - r.left);
      yTo(pointer.y - r.top);
      const vx = pointer.x - pointer.lastX;
      pointer.lastX = pointer.x;
      rTo(gsap.utils.clamp(-12, 12, vx * 0.6));
    };
    window.addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      gsap.ticker.remove(tick);
    };
  }, []);

  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!p || !isFinePointer()) return;
    const reduced = prefersReducedMotion();
    gsap.to(p, {
      scale: active === null ? 0 : 1,
      autoAlpha: active === null ? 0 : 1,
      duration: reduced ? 0 : 0.6,
      ease: "expo.out",
    });
    if (active !== null) {
      gsap.to(p.querySelector("[data-panel-track]"), { yPercent: -100 * active, duration: reduced ? 0 : 0.8, ease: "expo.inOut" });
    }
  }, [active]);

  return (
    <section ref={root} id="focus" aria-labelledby="focus-title" className="relative pt-[12vh] pb-[12vh]">
      <SectionHead index="02" label={t.label} aside={t.aside} />

      <div className="px-gutter mt-12 grid grid-cols-12 gap-x-4 md:mt-16">
        <h2
          id="focus-title"
          data-reveal="lines"
          className="col-span-12 max-w-[18ch] text-[clamp(34px,4.6vw,76px)] leading-[0.98] font-[350] tracking-[-0.03em] md:col-span-9"
        >
          <Accent parts={t.title} />
        </h2>
      </div>

      <div data-list className="relative mt-14 md:mt-20" onPointerLeave={() => setActive(null)}>
        <ul className="border-t border-line">
          {t.items.map((item, i) => {
            const isActive = active === i;
            const dimmed = active !== null && !isActive;
            return (
              <li
                key={item.title}
                tabIndex={0}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                data-cursor="hide"
                className="group relative overflow-hidden border-b border-line outline-offset-[-2px]"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 origin-bottom bg-paper transition-transform duration-700 [transition-timing-function:var(--ease-out)] ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <div
                  className={`px-gutter relative grid grid-cols-12 items-center gap-x-4 py-5 transition-[color,opacity] duration-500 md:py-6 ${
                    isActive ? "text-ink" : dimmed ? "opacity-35" : ""
                  }`}
                >
                  <span className="label col-span-2 md:col-span-1">0{i + 1}</span>
                  <h3
                    className={`display col-span-10 leading-[0.86] ${
                      lang === "ru" ? "text-[clamp(30px,5.2vw,92px)]" : "text-[clamp(38px,7vw,124px)]"
                    } transition-[font-variation-settings,translate] duration-700 [transition-timing-function:var(--ease-out)] md:col-span-7 ${
                      isActive
                        ? "translate-x-[1.5vw] [font-variation-settings:'wght'_820,'wdth'_70]"
                        : "[font-variation-settings:'wght'_300,'wdth'_74]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`col-span-10 col-start-3 mt-3 max-w-md text-[15px] leading-snug transition-[color,opacity] duration-500 md:col-span-4 md:col-start-9 md:mt-0 md:text-right ${
                      isActive ? "text-ink/75" : "text-paper-dim md:opacity-60"
                    }`}
                  >
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* cursor-following preview (desktop only) */}
        <div
          ref={panel}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 z-10 hidden h-[260px] w-[360px] overflow-hidden rounded-[4px] bg-brand shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] [@media(hover:hover)_and_(pointer:fine)]:block"
        >
          <div data-panel-track className="h-full">
            {t.items.map((item, i) => (
              <div key={item.title} className="relative h-full w-full">
                <div className="absolute inset-0 p-4">
                  <AsciiPreview program={item.program} active={active === i} />
                </div>
                <span className="label absolute right-3 bottom-3 bg-ink px-1.5 py-0.5 text-[11px] text-paper">{item.program}.js</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toolkit />
    </section>
  );
}
