import type { ReactNode } from "react";
import { ru } from "@/content/ru";
import { archivo, cormorant, flex, instrument, monoCyr } from "../fonts";
import { RootShell, buildMetadata } from "../shared";
import "../globals.css";

export const metadata = buildMetadata(ru, "/ru");
export { viewport } from "../shared";

export default function RussianLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell
      dict={ru}
      fontClass={`${archivo.variable} ${instrument.variable} ${monoCyr.variable} ${flex.variable} ${cormorant.variable}`}
    >
      {children}
    </RootShell>
  );
}
