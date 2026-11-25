"use client";

import { useRef } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { Accent, useDict } from "./I18n";

export default function Path() {
  const t = useDict().path;
  const total = t.items.length;
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const progress = el.querySelector<HTMLElement>("[data-progress]");
      const counter = el.querySelector<HTMLElement>("[data-counter]");
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progress) progress.style.transform = `scaleX(${self.progress})`;
            if (counter) {
              const n = Math.min(total, Math.max(1, Math.round(self.progress * (total - 1)) + 1));
              counter.textContent = String(n).padStart(2, "0");
            }
          },
        },
      });

      // inside the moving track: big numbers drift against the scroll for depth
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((n) => {
        gsap.fromTo(
          n,
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: "none",
            scrollTrigger: { trigger: n, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-panel-title]").forEach((t) => {
        gsap.from(t, {
          yPercent: 60,
          autoAlpha: 0,
          duration: 1.2,
          scrollTrigger: { trigger: t, containerAnimation: tween, start: "left 85%", toggleActions: "play none none reverse" },
        });
      });
    });
    return () => mm.revert();
  }, [total]);

  return (
    <section ref={root} id="path" aria-labelledby="path-title" className="relative bg-ink-2 hz:h-[100svh] hz:overflow-hidden">
      <div data-track className="flex flex-col hz:h-full hz:w-max hz:flex-row">
        {/* intro panel */}
        <div className="px-gutter flex flex-col justify-between pt-[14vh] pb-12 hz:h-full hz:w-[38vw] hz:pt-24">
          <p className="label text-paper-dim">
            <span className="text-accent">(04)</span> — {t.label}
          </p>
          <div className="mt-10 hz:mt-0">
            <h2
              id="path-title"
              data-reveal="lines"
              className="text-[clamp(44px,6vw,104px)] leading-[0.92] font-[300] tracking-[-0.035em]"
            >
              <Accent parts={t.title} />
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-sm text-[16px] leading-snug text-paper-dim">
              {t.intro}
            </p>
          </div>
          <p className="label mt-10 hidden items-center gap-3 text-paper-dim hz:flex">
            {t.more} <span aria-hidden="true">→</span>
          </p>
        </div>

        {t.items.map((item, i) => (
          <article
            key={item.title}
            className="px-gutter relative flex flex-col justify-between overflow-hidden border-t border-line py-12 hz:h-full hz:w-[44vw] hz:border-t-0 hz:border-l hz:pt-24 hz:pb-20"
          >
            {item.highlight ? (
              <span
                data-drift
                aria-hidden="true"
                className="display pointer-events-none absolute top-1/2 right-[-4vw] -translate-y-1/2 text-[38vw] font-[800] text-transparent opacity-60 [-webkit-text-stroke:1px_var(--accent)] hz:text-[26vw] [font-variation-settings:'wdth'_70,'wght'_800]"
              >
                {item.highlight}
              </span>
            ) : (
              <span
                data-drift
                aria-hidden="true"
                className="display pointer-events-none absolute top-[14%] right-[2vw] text-[30vw] leading-none font-[200] text-paper/[0.04] hz:text-[16vw]"
              >
                0{i + 1}
              </span>
            )}

            <div className="label relative flex justify-between text-paper-dim">
              <span>
                0{i + 1} — {item.kind}
              </span>
              <span className={item.highlight ? "text-accent" : ""}>{item.role}</span>
            </div>

            <h3
              data-panel-title={i > 0 ? "" : undefined}
              className="display relative mt-16 max-w-[10ch] text-[clamp(48px,6.2vw,112px)] hz:mt-0 [font-variation-settings:'wght'_560,'wdth'_78]"
            >
              {item.title}
            </h3>

            <p className="relative mt-8 max-w-[26rem] text-[17px] leading-[1.45] text-paper/80 hz:mt-0">{item.text}</p>
          </article>
        ))}
        <div aria-hidden="true" className="hidden hz:block hz:w-[8vw]" />
      </div>

      {/* pinned progress */}
      <div className="px-gutter pointer-events-none absolute inset-x-0 bottom-6 hidden items-center gap-6 hz:flex" aria-hidden="true">
        <span className="label tabular-nums">
          <span data-counter>01</span>
          <span className="text-paper-faint"> / 0{total}</span>
        </span>
        <div className="h-px flex-1 bg-line">
          <div data-progress className="h-full origin-left scale-x-0 bg-paper" />
        </div>
      </div>
    </section>
  );
}
