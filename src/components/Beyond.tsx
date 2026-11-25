"use client";

import { useRef } from "react";
import type { StickerStyle } from "@/content/types";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import { Accent, useDict } from "./I18n";
import SectionHead from "./SectionHead";

const STYLE: Record<StickerStyle, string> = {
  accent: "bg-brand text-paper rounded-full px-6 py-3 text-[clamp(17px,1.7vw,26px)] font-[500]",
  serif: "bg-paper text-ink rounded-[3px] px-5 py-2 serif italic text-[clamp(24px,2.6vw,42px)]",
  outline: "border border-paper/70 bg-ink text-paper rounded-full px-6 py-3 text-[clamp(16px,1.5vw,22px)]",
  solid: "bg-paper text-ink px-5 py-2 display text-[clamp(24px,3vw,52px)] [font-variation-settings:'wght'_800,'wdth'_70]",
  mono: "label bg-ink border border-line text-paper px-4 py-3 text-[12px]",
};

// resting places [left %, top %, tilt]. Mobile keeps a clear band around the heading.
const SPOTS_DESKTOP = [
  [6, 14, -8], [58, 8, 6], [28, 66, 4], [72, 58, -5], [44, 26, -3], [8, 72, 7], [80, 24, 10], [52, 80, -9], [24, 40, 3],
];
const SPOTS_MOBILE = [
  [4, 3, -6], [46, 6, 5], [8, 17, 4], [52, 20, -4], [6, 70, 6], [50, 72, -5], [12, 84, -3], [48, 88, 4], [26, 31, 3],
];

function Tracklist() {
  const t = useDict().beyond;
  return (
    <div className="px-gutter mt-20 md:mt-28">
      <div className="grid grid-cols-12 items-end gap-x-4 gap-y-4">
        <p data-reveal="fade" className="label col-span-12 text-paper-dim md:col-span-3">
          {t.sideLabel}
        </p>
        <h3
          data-reveal="lines"
          className="col-span-12 text-[clamp(30px,3.6vw,58px)] leading-[1] font-[350] tracking-[-0.03em] md:col-span-6"
        >
          <Accent parts={t.sideTitle} />
        </h3>
        <p data-reveal="fade" className="col-span-12 max-w-xs text-[15px] leading-snug text-paper-dim md:col-span-3 md:justify-self-end md:text-right">
          {t.sideIntro}
        </p>
      </div>

      <ol className="mt-10 border-t border-line md:mt-14">
        {t.tracks.map((tr, i) => (
          <li
            key={tr.title}
            data-reveal="fade"
            tabIndex={0}
            className="group grid grid-cols-12 items-center gap-x-4 border-b border-line py-5 outline-offset-[-2px] transition-colors duration-500 hover:bg-paper/[0.035] focus-visible:bg-paper/[0.035] md:py-6"
          >
            <span className="label col-span-2 flex items-center gap-3 text-paper-dim md:col-span-1">
              {/* index turns into a tiny equaliser while the row "plays" */}
              <span className="group-hover:hidden group-focus-visible:hidden">{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="hidden h-3.5 items-end gap-[2px] group-hover:flex group-focus-visible:flex">
                {[0, 1, 2, 3].map((b) => (
                  <span
                    key={b}
                    className="block h-full w-[3px] origin-bottom bg-accent motion-safe:animate-[eq_0.9s_ease-in-out_infinite]"
                    style={{ animationDelay: `${b * -0.22}s` }}
                  />
                ))}
              </span>
            </span>
            <h4 className="col-span-10 text-[clamp(26px,3vw,48px)] leading-[1] font-[380] tracking-[-0.025em] transition-[translate,color] duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-2 group-hover:text-accent md:col-span-4">
              {tr.title}
            </h4>
            <p className="col-span-10 col-start-3 mt-2 text-[15px] leading-snug text-paper-dim md:col-span-5 md:col-start-6 md:mt-0">{tr.text}</p>
            <span className="label col-span-12 mt-2 text-paper-faint md:col-span-2 md:mt-0 md:text-right">{tr.meta}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Beyond() {
  const d = useDict();
  const t = d.beyond;
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const desk = el.querySelector<HTMLElement>("[data-desk]")!;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-sticker]"));
    const reduced = prefersReducedMotion();
    const spots = window.innerWidth < 768 ? SPOTS_MOBILE : SPOTS_DESKTOP;
    let z = 10;

    const ctx = gsap.context(() => {
      items.forEach((it, i) => {
        const [left, top, tilt] = spots[i % spots.length];
        it.style.left = `${left}%`;
        it.style.top = `${top}%`;
        // keep every sticker on the desk, even on narrow screens
        const overflow = it.offsetLeft + it.offsetWidth - desk.clientWidth;
        gsap.set(it, { rotation: tilt, x: overflow > 0 ? -overflow - 12 : 0 });
      });
      if (!reduced) {
        gsap.from(items, {
          y: -120,
          autoAlpha: 0,
          rotation: (i) => spots[i % spots.length][2] * 4,
          duration: 1.4,
          ease: "elastic.out(1, 0.75)",
          stagger: 0.07,
          scrollTrigger: { trigger: desk, start: "top 70%", once: true },
        });
      }
    }, el);

    // drag with a little throw
    const cleanups = items.map((it) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, vx = 0, vy = 0, lx = 0, ly = 0, lt = 0, dragging = false;
      const bounds = () => {
        const r = desk.getBoundingClientRect();
        return {
          minX: -it.offsetLeft,
          maxX: r.width - it.offsetLeft - it.offsetWidth,
          minY: -it.offsetTop,
          maxY: r.height - it.offsetTop - it.offsetHeight,
        };
      };
      const down = (e: PointerEvent) => {
        dragging = true;
        it.setPointerCapture(e.pointerId);
        gsap.killTweensOf(it, "x,y");
        sx = lx = e.clientX;
        sy = ly = e.clientY;
        ox = Number(gsap.getProperty(it, "x"));
        oy = Number(gsap.getProperty(it, "y"));
        lt = performance.now();
        it.style.zIndex = String(++z);
        gsap.to(it, { scale: 1.08, rotation: 0, duration: 0.4, ease: "back.out(2)" });
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const b = bounds();
        gsap.set(it, {
          x: gsap.utils.clamp(b.minX, b.maxX, ox + e.clientX - sx),
          y: gsap.utils.clamp(b.minY, b.maxY, oy + e.clientY - sy),
        });
        const now = performance.now();
        const dt = Math.max(1, now - lt);
        vx = ((e.clientX - lx) / dt) * 16;
        vy = ((e.clientY - ly) / dt) * 16;
        lx = e.clientX;
        ly = e.clientY;
        lt = now;
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        const b = bounds();
        gsap.to(it, {
          x: gsap.utils.clamp(b.minX, b.maxX, Number(gsap.getProperty(it, "x")) + vx * 9),
          y: gsap.utils.clamp(b.minY, b.maxY, Number(gsap.getProperty(it, "y")) + vy * 9),
          scale: 1,
          rotation: gsap.utils.clamp(-14, 14, vx * 1.4),
          duration: reduced ? 0 : 1.1,
          ease: "expo.out",
        });
      };
      it.addEventListener("pointerdown", down);
      it.addEventListener("pointermove", move);
      it.addEventListener("pointerup", up);
      it.addEventListener("pointercancel", up);
      return () => {
        it.removeEventListener("pointerdown", down);
        it.removeEventListener("pointermove", move);
        it.removeEventListener("pointerup", up);
        it.removeEventListener("pointercancel", up);
      };
    });

    return () => {
      cleanups.forEach((c) => c());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="beyond" aria-labelledby="beyond-title" className="relative pt-[12vh] pb-[10vh]">
      <SectionHead index="05" label={t.label} aside={t.aside} />

      <div data-desk className="relative mx-[var(--gutter)] mt-10 h-[72svh] min-h-[520px] overflow-hidden md:h-[80svh]">
        <h2
          id="beyond-title"
          className="display pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[clamp(64px,13.5vw,240px)] font-[200] text-paper/90 select-none"
        >
          <span data-reveal="lines">{t.heading[0]}</span>
          <span data-reveal="lines" className="serif text-[0.9em] text-accent normal-case italic">
            {t.heading[1]}
          </span>
        </h2>

        {t.stickers.map((s, i) => (
          <button
            key={s.label}
            type="button"
            data-sticker
            data-cursor="Drag"
            aria-label={`${s.label} (${d.a11y.draggable})`}
            style={{ left: `${SPOTS_DESKTOP[i % SPOTS_DESKTOP.length][0]}%`, top: `${SPOTS_DESKTOP[i % SPOTS_DESKTOP.length][1]}%`, zIndex: 2 + i }}
            className={`absolute touch-none whitespace-nowrap select-none ${STYLE[s.style]}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Tracklist />
    </section>
  );
}
