"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "@/content/types";

const Ctx = createContext<Dict | null>(null);

export function I18nProvider({ dict, children }: { dict: Dict; children: ReactNode }) {
  return <Ctx.Provider value={dict}>{children}</Ctx.Provider>;
}

export function useDict(): Dict {
  const d = useContext(Ctx);
  if (!d) throw new Error("useDict must be used inside <I18nProvider>");
  return d;
}

/** Renders "before <accent>accent</accent> after" with the serif-italic accent style. */
export function Accent({ parts, className = "" }: { parts: [string, string, string]; className?: string }) {
  return (
    <>
      {parts[0]}
      <span className={`serif text-accent italic ${className}`}>{parts[1]}</span>
      {parts[2]}
    </>
  );
}
