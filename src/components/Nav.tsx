"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { useDict } from "./I18n";
import LocalTime from "./LocalTime";
import { getLenis, scrollToId } from "./SmoothScroll";

export default function Nav() {
  const d = useDict();
  const t = d.nav;
  const otherHref = d.lang === "en" ? "/ru" : "/";
  const city = d.hero.place.split(",")[0];
  const root = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("[data-nav-item]", { autoAlpha: 0, y: -12 });
      introDone.then(() =>
        gsap.to("[data-nav-item]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.05, delay: 0.6 }),
      );
    }, root);
    return () => ctx.revert();
  }, []);

  // a quiet backdrop once content scrolls underneath, so labels never collide with headings
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // mobile menu
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    if (open) {
      getLenis()?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? 0 : 0.9, ease: "expo.inOut" });
      gsap.fromTo(
        el.querySelectorAll("[data-menu-link]"),
        { yPercent: 110 },
        { yPercent: 0, duration: reduced ? 0 : 1, stagger: 0.05, delay: reduced ? 0 : 0.3 },
      );
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    getLenis()?.start();
    gsap.to(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: reduced ? 0 : 0.7,
      ease: "expo.inOut",
      onComplete: () => gsap.set(el, { visibility: "hidden" }),
    });
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToId(id), open ? 350 : 0);
  };

  const switchLink = (
    <a
      href={otherHref}
      hrefLang={d.lang === "en" ? "ru" : "en"}
      aria-label={t.switchAria}
      className="label inline-flex items-center gap-1.5 rounded-full border border-paper/30 px-2.5 py-1 transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
    >
      <span className="opacity-50">{d.lang.toUpperCase()}</span>
      <span aria-hidden="true">/</span>
      {t.switchLabel}
    </a>
  );

  return (
    <>
      <header
        ref={root}
        className={`px-gutter fixed inset-x-0 top-0 z-[80] flex items-center justify-between py-4 text-paper transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid && !open ? "border-b border-line bg-ink/75 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <a href="#top" onClick={go("top")} data-nav-item className="label group flex items-center gap-2" aria-label={`${site.name} — top`}>
          <span className="inline-block h-2 w-2 bg-paper transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:rotate-45" />
          <span>{site.name}</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="label flex gap-6">
            {t.items.map((item, i) => (
              <li key={item.id} data-nav-item>
                <a href={`#${item.id}`} onClick={go(item.id)} className="ulink pb-0.5">
                  <span className="text-paper-faint">0{i + 1}</span> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-nav-item className="label hidden items-center gap-5 lg:flex">
          <span>
            {city} — <LocalTime /> <span className="text-paper-faint">{t.gmt}</span>
          </span>
          {switchLink}
        </div>

        <div data-nav-item className="flex items-center gap-4 lg:hidden">
          {switchLink}
          <button
            type="button"
            className="label"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.close : t.menu}
          </button>
        </div>
      </header>

      <div
        ref={menu}
        id="mobile-menu"
        className="px-gutter invisible fixed inset-0 z-[70] flex flex-col justify-end bg-ink-2 pb-10 lg:hidden"
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-1">
          {t.items.map((item, i) => (
            <li key={item.id} className="split-line">
              <a
                data-menu-link
                href={`#${item.id}`}
                onClick={go(item.id)}
                tabIndex={open ? 0 : -1}
                className="display flex items-baseline gap-3 text-[clamp(44px,12vw,96px)] font-[650]"
              >
                <span className="label text-paper-faint">0{i + 1}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="label mt-10 text-paper-dim">
          {city} — <LocalTime />
        </p>
      </div>
    </>
  );
}
