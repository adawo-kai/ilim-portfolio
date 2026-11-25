"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import { finishIntro } from "@/lib/intro";
import { useDict } from "./I18n";
import { getLenis } from "./SmoothScroll";

const COLS = 5;
const SEEN_KEY = "ilim:intro-seen";

function introSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function Loader() {
  const t = useDict().loader;
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    const stopRaf = requestAnimationFrame(() => getLenis()?.stop());
    let cancelled = false;

    const release = () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
    const done = () => {
      release();
      setGone(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };

    // full show once per session; a quick fade after that (e.g. switching language)
    const quick = prefersReducedMotion() || introSeen();
    const counter = el.querySelector<HTMLElement>("[data-count]");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const state = { v: 0 };

    const ctx = gsap.context(() => {
      if (quick) {
        gsap.set("[data-content]", { autoAlpha: 0 });
        document.fonts.ready.then(() => {
          if (cancelled) return;
          finishIntro();
          gsap.to(el, { autoAlpha: 0, duration: 0.45, ease: "power2.out", onComplete: done });
        });
        return;
      }

      gsap.from("[data-word] > span", { yPercent: 110, duration: 1.2, stagger: 0.06, delay: 0.1 });
      gsap.from("[data-meta]", { autoAlpha: 0, y: 10, duration: 0.9, stagger: 0.08, delay: 0.35 });

      const count = gsap.to(state, {
        v: 100,
        duration: 1.9,
        ease: "power3.inOut",
        onUpdate: () => {
          if (counter) counter.textContent = String(Math.round(state.v)).padStart(3, "0");
          if (bar) bar.style.transform = `scaleX(${state.v / 100})`;
        },
      });

      Promise.all([count.then(), document.fonts.ready]).then(() => {
        if (cancelled) return;
        gsap
          .timeline({ onComplete: done })
          .to("[data-content]", { yPercent: -12, autoAlpha: 0, duration: 0.7, ease: "power3.in" })
          .add(() => finishIntro(), "-=0.15")
          .to("[data-col]", { yPercent: -100, duration: 1.05, ease: "expo.inOut", stagger: 0.06 }, "-=0.35");
      });
    }, el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(stopRaf);
      ctx.revert();
      release();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLS }).map((_, i) => (
          <div key={i} data-col className="h-full flex-1 bg-ink-2 [margin-right:-1px]" />
        ))}
      </div>

      <div data-content className="px-gutter absolute inset-0 flex flex-col justify-between py-6">
        <div className="label flex justify-between text-paper-dim">
          <span data-meta>{t.left}</span>
          <span data-meta>{t.right}</span>
        </div>

        <div className="flex flex-col items-start">
          <p data-word className="serif split-line text-[clamp(64px,12vw,200px)] leading-[0.9] italic">
            <span className="inline-block">{t.word}</span>
          </p>
          <p data-meta className="label mt-4 text-paper-dim">
            {t.gloss} <span className="text-accent">{t.glossNote}</span>
          </p>
        </div>

        <div>
          <div className="flex items-end justify-between">
            <span data-meta className="label text-paper-dim">
              {t.status}
            </span>
            <span
              data-count
              className="display text-[clamp(56px,9vw,150px)] font-[200] tabular-nums [font-variation-settings:'wdth'_80]"
            >
              000
            </span>
          </div>
          <div className="mt-4 h-px w-full bg-line">
            <div data-bar className="h-full w-full origin-left scale-x-0 bg-paper" />
          </div>
        </div>
      </div>
    </div>
  );
}
