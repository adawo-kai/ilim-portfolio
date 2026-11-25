import { Archivo, Cormorant, Instrument_Serif, JetBrains_Mono, Roboto_Flex } from "next/font/google";

// Latin — used by both languages
export const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], axes: ["wdth"], display: "swap" });
export const instrument = Instrument_Serif({
  variable: "--font-instrument-latin",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
export const monoLatin = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

// Cyrillic — loaded only by the Russian layout
export const monoCyr = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "cyrillic"], display: "swap" });
export const flex = Roboto_Flex({ variable: "--font-flex", subsets: ["cyrillic"], axes: ["wdth"], display: "swap" });
export const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["cyrillic"],
  weight: "500",
  style: ["italic"],
  display: "swap",
});
