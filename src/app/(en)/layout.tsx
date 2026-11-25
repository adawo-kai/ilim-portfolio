import type { ReactNode } from "react";
import { en } from "@/content/en";
import { archivo, instrument, monoLatin } from "../fonts";
import { RootShell, buildMetadata } from "../shared";
import "../globals.css";

export const metadata = buildMetadata(en, "/");
export { viewport } from "../shared";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell dict={en} fontClass={`${archivo.variable} ${instrument.variable} ${monoLatin.variable}`}>
      {children}
    </RootShell>
  );
}
