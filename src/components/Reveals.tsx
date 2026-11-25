"use client";

import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/gsap";

/**
 * One consistent text-reveal language for the whole site:
 *  data-reveal="lines" → masked line rise
 *  data-reveal="fade"  → soft fade-up
 *  data-reveal="rule"  → hairline draws from the left
 * Mounted once, after all sections.
 */
export default function Reveals() {
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.3,
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 28,
            duration: 1.2,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-reveal="rule"]').forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });
      });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
