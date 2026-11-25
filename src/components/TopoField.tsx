"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Procedural topographic map — a nod to the Ala-Too range above Bishkek.
 * Contour lines are iso-lines of an fbm height field; the pointer pushes
 * up a "peak" that the lines wrap around. Pure WebGL2, no dependencies.
 */

const VERT = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;      // in px, origin top-left
uniform float uPeak;      // 0..1 strength of pointer peak
uniform float uReveal;    // 0..1 intro
uniform vec3 uPaper;
uniform vec3 uAccent;
out vec4 o;

vec2 hash(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p){
  const float K1 = 0.366025404; const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o1 = vec2(m, 1.0 - m);
  vec2 b = a - o1 + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
  vec3 n = h*h*h*h * vec3(dot(a, hash(i)), dot(b, hash(i + o1)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for(int i = 0; i < 3; i++){ v += a * noise(p); p = r * p * 2.03; a *= 0.42; }
  return v;
}

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float s = min(uRes.x, uRes.y);
  vec2 uv = (frag - 0.5 * uRes) / s;
  float t = uTime * 0.018;

  // domain-warped terrain, ridge running diagonally like a mountain range
  vec2 q = uv * 0.85 + vec2(0.0, t);
  vec2 w = vec2(fbm(q + vec2(1.7, 9.2) + t), fbm(q + vec2(8.3, 2.8) - t));
  float h = fbm(q + 0.45 * w);
  h += 0.45 * smoothstep(0.9, -0.2, abs(uv.y + uv.x * 0.35 - 0.05));

  // pointer peak
  vec2 m = (uMouse - 0.5 * uRes) / s;
  float d = length(uv - m);
  float peak = exp(-d * d * 11.0) * 0.6 * uPeak;
  h += peak;

  float n = 17.0;
  float v = h * n;
  float f = fract(v);
  float df = fwidth(v);
  float dist = min(f, 1.0 - f);
  float line = 1.0 - smoothstep(df * 0.6, df * 1.6, dist);
  float index = step(abs(mod(floor(v + 0.5), 5.0)), 0.5);

  float alpha = line * (0.1 + index * 0.14);
  float glow = smoothstep(0.42, 0.0, d) * uPeak;
  vec3 col = mix(uPaper, uAccent, clamp(glow * 1.25, 0.0, 1.0));
  alpha *= 1.0 + glow * 2.4;

  // intro: lines draw outward from the centre
  float r = length(uv * vec2(0.8, 1.0));
  alpha *= smoothstep(uReveal * 1.6, uReveal * 1.6 - 0.35, r);

  // edge vignette
  vec2 e = frag / uRes;
  float vig = smoothstep(0.0, 0.18, e.y) * smoothstep(1.0, 0.75, e.y);
  alpha *= mix(0.35, 1.0, vig);

  o = vec4(col * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function TopoField({ revealAt }: { revealAt: Promise<void> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uPeak = u("uPeak"), uReveal = u("uReveal");
    const css = getComputedStyle(document.documentElement);
    gl.uniform3fv(u("uPaper"), hexToRgb(css.getPropertyValue("--paper") || "#eceae4"));
    gl.uniform3fv(u("uAccent"), hexToRgb(css.getPropertyValue("--accent") || "#0e9ad6"));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const reduced = prefersReducedMotion();
    let w = 0, h = 0, dpr = 1;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, peak: 0, tpeak: 0 };
    let reveal = 0, revealTarget = 0;
    let visible = true, raf = 0, last = performance.now(), time = 7.0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      if (!mouse.tpeak) {
        mouse.x = mouse.tx = w * 0.68;
        mouse.y = mouse.ty = h * 0.42;
      }
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) * dpr;
      mouse.ty = (e.clientY - rect.top) * dpr;
      mouse.tpeak = 1;
    };
    const onLeave = () => (mouse.tpeak = 0.0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const draw = () => {
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uPeak, mouse.peak);
      gl.uniform1f(uReveal, reveal);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      time += dt;
      // touch / idle: the peak slowly wanders on its own
      if (!mouse.tpeak) {
        mouse.tx = w * (0.62 + Math.sin(time * 0.21) * 0.16);
        mouse.ty = h * (0.45 + Math.cos(time * 0.17) * 0.14);
      }
      const k = 1 - Math.pow(0.0009, dt);
      mouse.x += (mouse.tx - mouse.x) * k * 0.6;
      mouse.y += (mouse.ty - mouse.y) * k * 0.6;
      mouse.peak += ((mouse.tpeak ? 1 : 0.55) - mouse.peak) * k * 0.25;
      reveal += (revealTarget - reveal) * (1 - Math.pow(0.12, dt));
      draw();
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    let cancelled = false;
    revealAt.then(() => {
      if (cancelled) return;
      revealTarget = 1;
      if (reduced) {
        reveal = 1;
        mouse.peak = 0.55;
        draw();
      }
    });

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      // free GPU objects but keep the context: React may re-run this effect on the same canvas
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [revealAt]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
