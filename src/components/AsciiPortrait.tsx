"use client";

import { useEffect, useRef } from "react";
import { isFinePointer, prefersReducedMotion } from "@/lib/gsap";

/**
 * The cut-out photo rendered as live ASCII.
 *  - every glyph takes the colour of the photo underneath (mixed toward paper)
 *  - glyphs "decode" from noise when the portrait scrolls into view
 *  - a few glyphs shimmer at random; glyphs near the pointer scramble
 *  - the pointer is a lens: inside it you see the real photo
 * The ASCII layer is cached on an offscreen canvas; each frame only touches
 * the cells that change, then composites the lens on top.
 */

const RAMP = ".:-=+*#%@";
const NOISE = "01<>/\\|{}[]#%&@$*+=-";
const PAPER = [236, 234, 228];

type Cell = { ch: string; color: string };

export default function AsciiPortrait({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const fine = isFinePointer();
    let disposed = false;
    let raf = 0;
    let visible = false;
    let started = false;

    const img = new Image();
    img.decoding = "async";
    img.src = src;

    const base = document.createElement("canvas");
    const bctx = base.getContext("2d")!;
    let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, cw = 0, ch = 0, yOff = 0;
    let cells: (Cell | null)[] = [];
    let revealAt: Float32Array = new Float32Array(0);
    let revealed: Uint8Array = new Uint8Array(0);
    const scrambled = new Map<number, number>(); // cell -> restore time
    const lens = { x: -999, y: -999, r: 0, tr: 0 };
    let t0 = 0;
    let font = "monospace";

    const drawCell = (i: number, glyph: string, color: string) => {
      const x = (i % cols) * cw, y = yOff + Math.floor(i / cols) * ch;
      bctx.clearRect(x, y, cw, ch);
      if (glyph === " ") return;
      bctx.fillStyle = color;
      bctx.fillText(glyph, x, y);
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (!W || !H || !img.naturalWidth) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = base.width = Math.round(W * dpr);
      canvas.height = base.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~85-100 columns on desktop, fewer on phones; glyph cells are 0.6 as wide as tall
      cols = Math.max(44, Math.min(100, Math.round(W / 4)));
      cw = W / cols;
      ch = cw / 0.6;
      rows = Math.floor(H / ch);
      yOff = H - rows * ch; // bottom-align the grid like the photo

      const s = document.createElement("canvas");
      s.width = cols;
      s.height = rows;
      const sctx = s.getContext("2d", { willReadFrequently: true })!;
      // object-contain, bottom aligned (same as the photo would be)
      const scale = Math.min(cols / img.naturalWidth, rows / (img.naturalHeight * (cw / ch)));
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale * (cw / ch);
      sctx.drawImage(img, (cols - dw) / 2, rows - dh, dw, dh);
      const px = sctx.getImageData(0, 0, cols, rows).data;

      // histogram-equalise luminance over the figure so the whole glyph ramp gets used
      const n = cols * rows;
      const lums = new Float32Array(n);
      const opaque: number[] = [];
      for (let i = 0; i < n; i++) {
        lums[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
        if (px[i * 4 + 3] / 255 >= 0.4) opaque.push(i);
      }
      const order = [...opaque].sort((a, b) => lums[a] - lums[b]);
      const eq = new Float32Array(n);
      order.forEach((i, rank) => (eq[i] = rank / Math.max(1, order.length - 1)));

      cells = new Array(n).fill(null);
      for (const i of opaque) {
        const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
        // blend equalised and raw luminance: contrast without losing the real tones
        const k = Math.min(1, eq[i] * 0.7 + lums[i] * 0.3);
        const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(k * RAMP.length))];
        // colour: photo tone pulled a little toward paper; brightness follows the glyph density
        const lift = 0.62 + 0.9 * k;
        const mix = (c: number, p: number) => Math.min(255, Math.round((c * 0.72 + p * 0.28) * lift));
        cells[i] = { ch: glyph, color: `rgb(${mix(r, PAPER[0])},${mix(g, PAPER[1])},${mix(b, PAPER[2])})` };
      }

      font = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace";
      bctx.font = `500 ${ch * 0.92}px ${font}, monospace`;
      bctx.textBaseline = "top";

      revealAt = new Float32Array(cols * rows);
      revealed = new Uint8Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const y = Math.floor(i / cols) / rows;
        revealAt[i] = y * 0.9 + Math.random() * 0.55; // top-down wave with grain
      }
      bctx.clearRect(0, 0, W, H);
      if (reduced || started) {
        cells.forEach((c, i) => {
          if (c) drawCell(i, c.ch, c.color);
          revealed[i] = 1;
        });
      }
      return true;
    };

    const composite = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);
      if (lens.r > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#0b0b0c";
        ctx.fillRect(lens.x - lens.r, lens.y - lens.r, lens.r * 2, lens.r * 2);
        const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
        ctx.drawImage(img, (W - dw) / 2, H - dh, dw, dh);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(14,154,214,0.9)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || now - last < 33) return;
      last = now;
      const t = (now - t0) / 1000;

      // 1) decode-in
      if (started && revealed.length) {
        for (let i = 0; i < cells.length; i++) {
          if (revealed[i]) continue;
          const c = cells[i];
          if (!c) {
            revealed[i] = 1;
            continue;
          }
          if (t >= revealAt[i]) {
            revealed[i] = 1;
            drawCell(i, c.ch, c.color);
          } else if (t >= revealAt[i] - 0.35) {
            drawCell(i, NOISE[(Math.random() * NOISE.length) | 0], "rgba(14,154,214,0.95)");
          }
        }
      }

      // 2) idle shimmer
      for (let n = 0; n < 6; n++) {
        const i = (Math.random() * cells.length) | 0;
        const c = cells[i];
        if (c && revealed[i] && !scrambled.has(i)) {
          drawCell(i, NOISE[(Math.random() * NOISE.length) | 0], c.color);
          scrambled.set(i, now + 120 + Math.random() * 200);
        }
      }

      // 3) scramble around the lens edge
      if (lens.r > 4) {
        const ring = lens.r + cw * 2.2;
        const c0 = Math.max(0, Math.floor((lens.x - ring) / cw)), c1 = Math.min(cols - 1, Math.ceil((lens.x + ring) / cw));
        const r0 = Math.max(0, Math.floor((lens.y - yOff - ring) / ch)), r1 = Math.min(rows - 1, Math.ceil((lens.y - yOff + ring) / ch));
        for (let y = r0; y <= r1; y++)
          for (let x = c0; x <= c1; x++) {
            const i = y * cols + x;
            const c = cells[i];
            if (!c || !revealed[i]) continue;
            const d = Math.hypot(x * cw + cw / 2 - lens.x, yOff + y * ch + ch / 2 - lens.y);
            if (d > lens.r && d < ring && Math.random() < 0.35) {
              drawCell(i, NOISE[(Math.random() * NOISE.length) | 0], "rgba(14,154,214,0.95)");
              scrambled.set(i, now + 90);
            }
          }
      }

      // restore scrambled cells
      scrambled.forEach((until, i) => {
        if (now >= until) {
          const c = cells[i];
          if (c) drawCell(i, c.ch, c.color);
          scrambled.delete(i);
        }
      });

      lens.r += (lens.tr - lens.r) * 0.22;
      composite();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      lens.x = x;
      lens.y = y;
      lens.tr = inside ? Math.max(56, W * 0.2) : 0;
    };
    const onLeave = () => (lens.tr = 0);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started && cells.length) {
          started = true;
          t0 = performance.now();
        }
      },
      { threshold: 0.15 },
    );

    const ro = new ResizeObserver(() => {
      if (build()) composite();
    });

    img
      .decode()
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        if (disposed) return;
        build();
        composite();
        ro.observe(canvas);
        io.observe(canvas);
        if (reduced) return;
        raf = requestAnimationFrame(frame);
        if (fine) {
          window.addEventListener("pointermove", onMove, { passive: true });
          canvas.addEventListener("pointerleave", onLeave);
        } else {
          canvas.addEventListener("pointermove", onMove);
          canvas.addEventListener("pointerup", onLeave);
          canvas.addEventListener("pointercancel", onLeave);
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, [src]);

  return <canvas ref={canvasRef} role="img" aria-label={alt} className={`block h-full w-full ${className}`} />;
}
