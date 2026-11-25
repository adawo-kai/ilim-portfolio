import type { Dict } from "@/content/types";
import About from "./About";
import Beyond from "./Beyond";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Disciplines from "./Disciplines";
import Hero from "./Hero";
import { I18nProvider } from "./I18n";
import Loader from "./Loader";
import Nav from "./Nav";
import Path from "./Path";
import Reveals from "./Reveals";
import SmoothScroll from "./SmoothScroll";
import Work from "./Work";

/** The whole one-page site, rendered for one language. */
export default function Site({ dict }: { dict: Dict }) {
  return (
    <I18nProvider dict={dict}>
      <SmoothScroll />
      <Loader />
      <Cursor />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Disciplines />
        <Work />
        <Path />
        <Beyond />
        <Contact />
      </main>
      <Reveals />
      <div className="grain" aria-hidden="true" />
    </I18nProvider>
  );
}
