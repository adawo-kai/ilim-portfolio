"use client";

/**
 * A tiny one-shot signal: the loader resolves it when its curtain starts
 * lifting, and the hero waits for it before playing its entrance.
 */
let resolve: () => void = () => {};
let done = false;

export const introDone: Promise<void> =
  typeof window === "undefined"
    ? Promise.resolve()
    : new Promise<void>((r) => {
        resolve = () => {
          done = true;
          r();
        };
      });

export function finishIntro() {
  if (!done) resolve();
}
