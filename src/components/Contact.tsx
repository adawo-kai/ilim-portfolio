"use client";

import { site } from "@/content/site";
import { useDict } from "./I18n";
import LocalTime from "./LocalTime";
import Magnetic from "./Magnetic";
import SectionHead from "./SectionHead";
import { scrollToId } from "./SmoothScroll";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M6 18 18 6M8 6h10v10" />
    </svg>
  );
}

export default function Contact() {
  const d = useDict();
  const t = d.contact;
  const city = d.hero.place.split(",")[0];

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden pt-[12vh]">
      <SectionHead index="06" label={t.label} aside={t.aside} />

      <div className="px-gutter mt-12 grid grid-cols-12 items-end gap-x-4 gap-y-12 md:mt-16">
        <h2 id="contact-title" className="display col-span-12 text-[clamp(52px,11vw,200px)] font-[250] md:col-span-9">
          <span data-reveal="lines" className="block">
            {t.title[0]}
          </span>
          <span data-reveal="lines" className="block">
            {t.title[1]} <span className="serif text-[1.02em] text-accent normal-case italic">{t.title[2]}</span>
          </span>
        </h2>

        <div className="col-span-12 flex md:col-span-3 md:justify-end md:pb-[2vw]">
          <Magnetic strength={0.4}>
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer"
              data-cursor="hide"
              className="group relative grid h-[clamp(140px,13vw,200px)] w-[clamp(140px,13vw,200px)] place-items-center overflow-hidden rounded-full bg-brand text-paper"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-y-full rounded-full bg-paper transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:translate-y-0"
              />
              <span className="relative text-center text-[15px] leading-tight transition-colors duration-500 group-hover:text-ink">
                {t.button[0]}
                <br />
                <span className="serif text-[22px] italic">{t.button[1]}</span>
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      <ul className="px-gutter mt-16 md:mt-24">
        {t.links.map((c) => {
          const external = c.href.startsWith("http");
          const inner = (
            <>
              <span className="display text-[clamp(30px,4.4vw,72px)] transition-[translate,font-variation-settings] duration-700 [transition-timing-function:var(--ease-out)] [font-variation-settings:'wght'_320,'wdth'_80] group-hover:translate-x-[1.2vw] group-hover:[font-variation-settings:'wght'_760,'wdth'_80]">
                {c.label}
              </span>
              <span className="flex items-center gap-4 text-paper-dim transition-colors duration-500 group-hover:text-paper">
                <span className="label hidden normal-case sm:inline">{c.href ? c.handle : t.soon}</span>
                {c.href ? (
                  <Arrow className="h-8 w-8 transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:rotate-45 md:h-12 md:w-12" />
                ) : (
                  <span className="label rounded-full border border-line px-3 py-1.5 sm:hidden">{t.soon}</span>
                )}
              </span>
            </>
          );
          return (
            <li key={c.label} data-reveal="fade" className="border-t border-line last:border-b">
              {c.href ? (
                <a
                  href={c.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  data-cursor="hide"
                  className="group relative flex items-center justify-between gap-6 overflow-hidden py-6 md:py-8"
                >
                  {inner}
                </a>
              ) : (
                <div className="relative flex items-center justify-between gap-6 overflow-hidden py-6 opacity-50 md:py-8">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {/* name marquee */}
      <div className="fade-x mt-[12vh] overflow-hidden border-y border-line py-6" aria-hidden="true">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {[t.marquee[0], t.marqueeAccent, ...t.marquee.slice(1)].map((w) => (
                <span key={w} className="flex items-center">
                  <span
                    className={
                      w === t.marqueeAccent
                        ? "serif px-[3vw] text-[9vw] leading-none text-accent italic"
                        : "display px-[3vw] text-[9vw] font-[200] [font-variation-settings:'wdth'_80]"
                    }
                  >
                    {w}
                  </span>
                  <span className="inline-block h-[1.2vw] w-[1.2vw] rotate-45 bg-paper/40" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="px-gutter label grid grid-cols-2 gap-y-4 py-8 text-paper-dim md:grid-cols-4">
        <span>{t.rights}</span>
        <span className="text-right md:text-left">{t.built}</span>
        <span>
          {city} — <LocalTime seconds />
        </span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("top");
          }}
          className="ulink justify-self-end"
        >
          {t.top}
        </a>
      </footer>
    </section>
  );
}
