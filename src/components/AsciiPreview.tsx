"use client";

import { useEffect, useRef } from "react";
import type { Program } from "@/content/types";

/**
 * Tiny ASCII "programs" — one per discipline. Each program maps a grid
 * cell + time to a character. Rendered to a 2D canvas, ~30fps, only
 * while `active` is true.
 */


const RAMP = " .·:-=+*#%@";
const CODE = "constfunctionreturnawaitimportexport=>(){}[];<>/".split("");

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const programs: Record<Program, (x: number, y: number, t: number, cols: number, rows: number) => string> = {
  code(x, y, t, cols) {
    const row = y;
    if (row % 2 === 1) return " ";
    const indent = (Math.floor(hash(1, row) * 4) % 4) * 2;
    const len = indent + 6 + Math.floor(hash(2, row) * (cols - indent - 8));
    const cycle = (t * 22) % (cols * 12);
    const typed = cycle - (row / 2) * cols * 0.9;
    if (x < indent || x >= len) return x === Math.floor(typed) && typed < len ? "█" : " ";
    if (x > typed) return x === Math.floor(typed) + 1 && typed > indent ? "█" : " ";
    if (hash(x, row) < 0.16) return " ";
    return CODE[Math.floor(hash(x * 3, row * 7) * CODE.length)];
  },
  neural(x, y, t, cols, rows) {
    const layers = [0.12, 0.38, 0.62, 0.88];
    const counts = [3, 5, 5, 2];
    const px = x / cols, py = (y + 0.5) / rows;
    let v = 0;
    for (let l = 0; l < layers.length; l++) {
      for (let n = 0; n < counts[l]; n++) {
        const ny = (n + 1) / (counts[l] + 1);
        const d = Math.hypot((px - layers[l]) * 1.8, py - ny);
        if (d < 0.05) return "@";
        if (d < 0.075) return "o";
        if (l < layers.length - 1) {
          for (let m = 0; m < counts[l + 1]; m++) {
            const my = (m + 1) / (counts[l + 1] + 1);
            const a = layers[l], b = layers[l + 1];
            if (px < a || px > b) continue;
            const k = (px - a) / (b - a);
            const ly = ny + (my - ny) * k;
            if (Math.abs(py - ly) < 0.018) {
              const pulse = (t * 0.6 + n * 0.13 + m * 0.07) % 1;
              v = Math.max(v, Math.abs(k - pulse) < 0.06 ? 1 : 0.35);
            }
          }
        }
      }
    }
    return v >= 1 ? "*" : v > 0 ? "·" : " ";
  },
  wave(x, y, t, cols, rows) {
    const u = x / cols - 0.5, w = y / rows - 0.5;
    const a = Math.sin(Math.hypot(u + 0.25, w) * 26 - t * 2.4);
    const b = Math.sin(Math.hypot(u - 0.25, w + 0.1) * 22 - t * 2.0);
    const v = (a + b) * 0.25 + 0.5;
    return RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)))];
  },
  maze(x, y, t, cols) {
    const reveal = (t * 40) % (cols * 30);
    const i = y * cols + x;
    if (i > reveal) return " ";
    const flip = Math.floor(t * 0.7 + hash(x, y) * 3) % 2;
    return hash(x + flip * 31, y) < 0.5 ? "╱" : "╲";
  },
  grid(x, y, t, cols, rows) {
    const boxes = [
      [0, 0, cols - 1, rows - 1],
      [2, 2, Math.floor(cols * 0.55), Math.floor(rows * 0.5)],
      [Math.floor(cols * 0.6), 2, cols - 3, Math.floor(rows * 0.5)],
      [2, Math.floor(rows * 0.58), cols - 3, rows - 3],
    ];
    const s = Math.sin(t * 1.4) * 0.5 + 0.5;
    boxes[2][0] = Math.floor(cols * (0.58 + s * 0.08));
    boxes[1][2] = boxes[2][0] - 3;
    for (const [x0, y0, x1, y1] of boxes) {
      const onX = x === x0 || x === x1, onY = y === y0 || y === y1;
      const inside = x >= x0 && x <= x1 && y >= y0 && y <= y1;
      if (!inside) continue;
      if (onX && onY) return "+";
      if (onY) return "─";
      if (onX) return "│";
    }
    // content lines inside the bottom box
    if (y > rows * 0.58 + 1 && y < rows - 4 && x > 4 && x < cols * (0.4 + 0.5 * hash(1, y)) && y % 2 === 0) return "▬";
    if (y === 4 && x > 4 && x < boxes[1][2] - 2) return "■";
    return " ";
  },
};

export default function AsciiPreview({ program, active }: { program: Program; active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !active) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.clientWidth, H = c.clientHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cell = 12;
    const cols = Math.floor(W / (cell * 0.62)), rows = Math.floor(H / cell);
    const cw = W / cols;
    ctx.font = `500 ${cell}px ${getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"}, monospace`;
    ctx.textBaseline = "top";
    let raf = 0, last = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#eceae4";
      const fn = programs[program];
      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) line += fn(x, y, t, cols, rows);
        for (let x = 0; x < cols; x++) {
          const ch = line[x];
          if (ch !== " ") ctx.fillText(ch, x * cw, y * cell);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, program]);

  return <canvas ref={canvas} aria-hidden="true" className="h-full w-full" />;
}
