"use client";

import { Accent, useDict } from "./I18n";
import SectionHead from "./SectionHead";

/** Typographic "spec sheet" of real projects — two staggered columns on desktop. */
export default function Work() {
  const t = useDict().work;

  return (
    <section id="work" aria-labelledby="work-title" className="relative pt-[10vh] pb-[14vh]">
      <SectionHead index="03" label={t.label} aside={t.aside} />

      <div className="px-gutter mt-12 grid grid-cols-12 items-end gap-x-4 gap-y-6 md:mt-16">
        <h2
          id="work-title"
          data-reveal="lines"
          className="col-span-12 max-w-[16ch] text-[clamp(34px,4.6vw,76px)] leading-[0.98] font-[350] tracking-[-0.03em] md:col-span-8"
        >
          <Accent parts={t.title} />
        </h2>
        <p data-reveal="fade" className="col-span-12 max-w-sm text-[16px] leading-snug text-paper-dim md:col-span-4 md:justify-self-end md:text-right">
          {t.intro}
        </p>
      </div>

      <ol className="px-gutter mt-14 grid grid-cols-1 gap-x-[6vw] gap-y-14 md:mt-20 md:grid-cols-2 md:gap-y-20">
        {t.items.map((item, i) => (
          <li key={item.title} data-reveal="fade" className={`group relative ${i % 2 === 1 ? "md:translate-y-[14vh]" : ""}`}>
            <div className="label flex items-center justify-between border-t border-line pt-4 text-paper-dim">
              <span className="transition-colors duration-300 group-hover:text-accent">0{i + 1}</span>
              <span>{item.kind}</span>
            </div>
            <h3 className="display mt-7 text-[clamp(40px,4.8vw,84px)] [font-variation-settings:'wght'_560,'wdth'_78] transition-[font-variation-settings] duration-700 [transition-timing-function:var(--ease-out)] group-hover:[font-variation-settings:'wght'_780,'wdth'_74]">
              {item.title}
            </h3>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-full origin-left scale-x-[0.12] bg-accent transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-x-100"
            />
            <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.5] text-paper/80">{item.text}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ul className="flex flex-wrap gap-2" aria-label="Stack">
                {item.stack.map((s) => (
                  <li key={s} className="label rounded-full border border-line px-3 py-1.5 text-paper-dim">
                    {s}
                  </li>
                ))}
              </ul>
              {item.link ? (
                <a
                  href={item.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="label group/link inline-flex items-center gap-2 text-accent"
                >
                  <span className="ulink pb-0.5">{item.link.label}</span>
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover/link:translate-x-1 group-hover/link:-translate-y-1">
                    ↗
                  </span>
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
