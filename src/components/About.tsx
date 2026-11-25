"use client";

import { useRef } from "react";
import { gsap, SplitText, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";
import AsciiPortrait from "./AsciiPortrait";
import { useDict } from "./I18n";
import SectionHead from "./SectionHead";

/** One annotation in the "spec sheet" around the portrait. */
function Callout({ k, v, side }: { k: string; v: string; side: "left" | "right" }) {
  return (
    <li data-callout className={`relative flex flex-col ${side === "left" ? "md:items-end md:text-right" : ""}`}>
      <span className="label text-paper-dim">{k}</span>
      <span className="mt-1.5 text-[clamp(17px,1.45vw,23px)] leading-tight">{v}</span>
      {/* leader line toward the figure (desktop) */}
      <span
        aria-hidden="true"
        data-leader
        className={`absolute top-[9px] hidden h-px w-[4.5vw] bg-paper/35 md:block ${
          side === "left" ? "left-full ml-4 origin-left" : "right-full mr-4 origin-right"
        }`}
      >
        <span className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent ${side === "left" ? "right-0" : "left-0"}`} />
      </span>
    </li>
  );
}

export default function About() {
  const d = useDict();
  const t = d.about;
  const root = useRef<HTMLElement>(null);
  const left = t.callouts.slice(0, 3);
  const right = t.callouts.slice(3);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const statement = el.querySelector("[data-statement]")!;
        SplitText.create(statement, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: statement, start: "top 78%", end: "bottom 50%", scrub: true },
              },
            ),
        });

        gsap.from("[data-word]", {
          yPercent: 100,
          duration: 1.6,
          scrollTrigger: { trigger: "[data-word]", start: "top 85%", once: true },
        });

        // the figure rises out of its stage, the big "18" drifts slower behind it
        const stage = el.querySelector("[data-stage]")!;
        gsap.from("[data-photo]", {
          yPercent: 14,
          autoAlpha: 0,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: stage, start: "top 75%", once: true },
        });
        gsap.fromTo(
          "[data-eighteen]",
          { yPercent: 18 },
          { yPercent: -12, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from("[data-callout]", {
          autoAlpha: 0,
          y: 18,
          duration: 1,
          stagger: 0.08,
          scrollTrigger: { trigger: stage, start: "top 65%", once: true },
        });
        gsap.from("[data-leader]", {
          scaleX: 0,
          duration: 1.2,
          ease: "expo.inOut",
          stagger: 0.08,
          delay: 0.3,
          scrollTrigger: { trigger: stage, start: "top 65%", once: true },
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative pt-[12vh] pb-[10vh]">
      <SectionHead index="01" label={t.label} aside={t.aside} />

      {/* dictionary entry + statement */}
      <div className="px-gutter mt-12 grid grid-cols-12 gap-x-4 gap-y-12 md:mt-16">
        <div className="col-span-12 md:col-span-5">
          <h2 id="about-title" className="sr-only">
            {t.heading}
          </h2>
          <p className="serif overflow-clip pb-[0.08em] text-[clamp(96px,16vw,260px)] leading-[0.85] italic" lang={d.lang === "ru" ? "ky" : undefined}>
            <span data-word className="inline-block">
              {t.word}
            </span>
          </p>
          <p data-reveal="fade" className="label mt-6 flex gap-4 text-paper-dim">
            <span>{t.transcription}</span>
            <span className="text-accent">{t.partOfSpeech}</span>
          </p>
          <ol data-reveal="fade" className="mt-6 max-w-sm space-y-2 text-[17px] leading-snug">
            {t.meanings.map((m, i) => (
              <li key={m} className="flex gap-3">
                <span className="label pt-1 text-paper-faint">{i + 1}.</span>
                <span className={i === 1 ? "serif text-[1.15em] italic" : ""}>{m}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="col-span-12 md:col-span-7">
          <p
            data-statement
            className="text-[clamp(28px,3.6vw,58px)] leading-[1.08] font-[380] tracking-[-0.02em] [font-variation-settings:'wdth'_96]"
          >
            {t.statement}
          </p>
        </div>
      </div>

      {/* portrait stage with callouts */}
      <div data-stage className="px-gutter relative mt-20 grid grid-cols-12 items-center gap-x-4 md:mt-28">
        <span
          data-eighteen
          aria-hidden="true"
          className="display pointer-events-none absolute top-[4%] left-1/2 -translate-x-1/2 text-[clamp(260px,46vw,760px)] font-[800] text-transparent [-webkit-text-stroke:1px_rgba(236,234,228,0.14)] [font-variation-settings:'wght'_800,'wdth'_70]"
        >
          18
        </span>

        <ul className="relative order-2 col-span-6 mt-10 space-y-8 md:order-1 md:col-span-3 md:mt-0 md:space-y-14">
          {left.map((c) => (
            <Callout key={c.k} {...c} side="left" />
          ))}
        </ul>

        <div className="relative order-1 col-span-12 flex justify-center md:order-2 md:col-span-6" data-cursor="hide">
          <div data-photo className="relative h-[min(92svh,920px)] w-auto [aspect-ratio:519/1158]">
            <AsciiPortrait src="/portrait/ilim-color.webp" alt={d.a11y.portraitAlt} />
          </div>
          {/* floor line */}
          <span aria-hidden="true" className="absolute right-[10%] bottom-0 left-[10%] h-px bg-line" />
        </div>

        <ul className="relative order-3 col-span-6 mt-10 space-y-8 md:col-span-3 md:mt-0 md:space-y-14">
          {right.map((c) => (
            <Callout key={c.k} {...c} side="right" />
          ))}
        </ul>
      </div>

      {/* how I work */}
      <div className="px-gutter mt-20 md:mt-24">
        <p data-reveal="fade" className="label mb-6 text-paper-dim">
          {t.principlesLabel}
        </p>
        <ol className="grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {t.principles.map((p, i) => (
            <li
              key={p.title}
              data-reveal="fade"
              data-delay={String(i * 0.08)}
              className="group border-b border-line py-7 sm:pr-8 lg:border-r lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="label text-accent">0{i + 1}</span>
              <h3 className="mt-8 text-[clamp(22px,1.9vw,30px)] leading-[1.05] font-[450] tracking-[-0.02em] transition-[font-variation-settings] duration-500 group-hover:[font-variation-settings:'wght'_750,'wdth'_100]">
                {p.title}
              </h3>
              <p className="mt-3 max-w-xs text-[15px] leading-snug text-paper-dim">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
