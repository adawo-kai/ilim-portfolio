"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { useDict } from "./I18n";
import TopoField from "./TopoField";
import { scrollToId } from "./SmoothScroll";

const W_BASE = 260;
const W_MAX = 900;
const WD_BASE = 100;
const WD_MAX = 78;

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span key={i} data-letter className="inline-block will-change-transform">
          {c}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const d = useDict();
  const t = d.hero;
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const name = el.querySelector<HTMLElement>("[data-name]")!;
    const fitLine = el.querySelector<HTMLElement>("[data-fit]")!;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
    const coord = el.querySelector<HTMLElement>("[data-coord]");

    // --- fit ALISHEROV to the container width, ILIM shares the size
    // measured at the resting (base) axes so live weight changes never cause overflow
    const fit = () => {
      const saved = letters.map((l) => l.style.fontVariationSettings);
      letters.forEach((l) => (l.style.fontVariationSettings = `"wght" ${W_BASE}, "wdth" ${WD_BASE}`));
      name.style.fontSize = "100px";
      const avail = name.clientWidth;
      const width = fitLine.scrollWidth;
      if (width > 0) name.style.fontSize = `${(100 * avail * 0.97) / width}px`;
      letters.forEach((l, i) => (l.style.fontVariationSettings = saved[i]));
    };

    // --- per-letter variable-font proximity
    const state = { intro: reduced ? 0 : 1, px: -9999, py: -9999, active: false, t: 0 };
    const weights = letters.map(() => 0);
    const apply = (i: number, k: number) => {
      const wght = W_BASE + (W_MAX - W_BASE) * k;
      const wdth = WD_BASE + (WD_MAX - WD_BASE) * k;
      letters[i].style.fontVariationSettings = `"wght" ${wght.toFixed(0)}, "wdth" ${wdth.toFixed(1)}`;
    };
    letters.forEach((_, i) => apply(i, reduced ? 0 : 1));

    const tick = (_time: number, dt: number) => {
      state.t += dt / 1000;
      const vw = window.innerWidth;
      const radius = Math.max(220, vw * 0.2);
      const heroBottom = el.getBoundingClientRect().bottom;
      if (heroBottom < 0) return;
      letters.forEach((letter, i) => {
        let target = 0;
        if (state.active) {
          const r = letter.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const d = Math.hypot(state.px - cx, (state.py - cy) * 1.4);
          target = Math.max(0, 1 - d / radius);
          target = target * target * (3 - 2 * target);
        }
        const stagger = Math.min(1, Math.max(0, state.intro * 1.6 - (letters.length - i) * 0.04));
        target = Math.max(target, stagger);
        weights[i] += (target - weights[i]) * Math.min(1, dt / 120);
        apply(i, weights[i]);
      });
      if (coord && state.active) {
        const rect = el.getBoundingClientRect();
        const lat = site.coords.lat + (0.5 - (state.py - rect.top) / rect.height) * 0.36;
        const lng = site.coords.lng + ((state.px - rect.left) / rect.width - 0.5) * 0.62;
        coord.textContent = `${lat.toFixed(4)}° N   ${lng.toFixed(4)}° E`;
      }
    };

    // mouse hovers; on touch the name reacts while a finger is on the screen
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0) return;
      state.px = e.clientX;
      state.py = e.clientY;
      state.active = true;
    };
    const onLeave = () => (state.active = false);
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") state.active = false;
    };
    let cancelled = false;

    const ctx = gsap.context(() => {
      fit();
      document.fonts.ready.then(() => {
        fit();
        ScrollTrigger.refresh();
      });

      if (reduced) return;

      gsap.set(letters, { yPercent: 105 });
      gsap.set("[data-intro]", { autoAlpha: 0 });
      gsap.set("[data-fade]", { autoAlpha: 0, y: 14 });

      // the loader waits for fonts, so lines are measured with the real typeface here
      introDone.then(() => {
        if (cancelled) return;
        ctx.add(() => {
          const split = SplitText.create("[data-intro]", { type: "lines", mask: "lines", linesClass: "split-line" });
          gsap.set("[data-intro]", { autoAlpha: 1 });
          const tl = gsap.timeline({ delay: 0.15 });
          tl.to(letters, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.045 })
            .to(state, { intro: 0, duration: 2.2, ease: "power2.inOut" }, 0.5)
            .from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.08 }, 0.55)
            .to("[data-fade]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 0.75);
        });
      });

      // gentle exit as the page scrolls away
      gsap.to("[data-name]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-topo]", {
        autoAlpha: 0.25,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);

    const ro = new ResizeObserver(fit);
    ro.observe(name);
    if (!reduced) gsap.ticker.add(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      cancelled = true;
      ro.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[640px] flex-col overflow-hidden [height:100svh]"
    >
      <div data-topo className="absolute inset-0">
        <TopoField revealAt={introDone} />
      </div>

      <div className="px-gutter relative grid grid-cols-12 gap-x-4 pt-[16svh] md:pt-[18svh]">
        <p data-fade className="label col-span-6 text-paper-dim md:col-span-3">
          {t.metaLeft[0]}
          <br />
          <span className="text-paper-faint">{t.metaLeft[1]}</span>
        </p>
        <p data-fade className="label col-span-6 text-right text-paper-dim md:col-span-3 md:col-start-10">
          {t.metaRight[0]}
          <br />
          {t.metaRight[1]}
        </p>
      </div>

      <div className="px-gutter relative mt-auto">
        <h1 id="hero-title" className="sr-only">
          {d.a11y.heroTitle}
        </h1>
        <div data-name className="display w-full text-[18vw] font-[260] text-paper select-none">
          <div className="relative flex items-end justify-between gap-6">
            <span aria-hidden="true" className="block overflow-clip pt-[0.04em]">
              <Letters text="ILIM" />
            </span>
            <p className="relative mb-[0.3em] hidden max-w-[30rem] text-[16px] leading-[1.45] font-normal tracking-normal normal-case before:absolute before:-inset-10 before:-z-10 before:bg-[radial-gradient(closest-side,rgba(11,11,12,0.92),rgba(11,11,12,0))] md:block lg:text-[19px] [font-variation-settings:'wght'_400,'wdth'_100]">
              <span data-intro className="block text-paper">
                {t.intro}{" "}
                <span className="serif text-[1.18em] text-accent italic">{t.introAccent}</span>
              </span>
            </p>
          </div>
          <span aria-hidden="true" data-fit className="block w-max overflow-clip pt-[0.04em] whitespace-nowrap">
            <Letters text="ALISHEROV" />
          </span>
        </div>

        <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.45] md:hidden">
          <span data-intro className="block">
            {t.intro}{" "}
            <span className="serif text-[1.18em] text-accent italic">{t.introAccent}</span>
          </span>
        </p>
      </div>

      <div className="px-gutter relative grid grid-cols-12 items-end gap-x-4 pt-8 pb-6">
        <a
          data-fade
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("about");
          }}
          data-cursor="↓"
          className="label col-span-6 flex items-center gap-3 text-paper md:col-span-3"
        >
          <span className="relative block h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(0.76,0,0.24,1)_infinite] bg-paper" />
          </span>
          {t.scroll}
        </a>
        <p data-fade className="label col-span-6 hidden text-center text-paper-dim md:col-span-6 md:block" aria-hidden="true">
          <span className="text-paper-faint">{t.cursor} </span>
          <span data-coord className="whitespace-pre tabular-nums">
            {site.coords.lat}° N   {site.coords.lng}° E
          </span>
        </p>
        <p data-fade className="label col-span-6 text-right text-paper-dim md:col-span-3">
          {t.age}
          <br />
          {t.place}
        </p>
      </div>
    </section>
  );
}
