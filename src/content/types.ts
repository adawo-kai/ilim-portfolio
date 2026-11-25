export type Lang = "en" | "ru";

export type Program = "code" | "neural" | "wave" | "maze" | "grid";
export type StickerStyle = "accent" | "serif" | "outline" | "solid" | "mono";

/** Three-part heading: plain text, an accented serif-italic phrase, plain text. */
export type Accented = [before: string, accent: string, after: string];

export type Dict = {
  lang: Lang;
  meta: { title: string; description: string; ogTitle: string; locale: string };
  a11y: { skip: string; heroTitle: string; draggable: string; portraitAlt: string };
  nav: {
    items: { id: string; label: string }[];
    menu: string;
    close: string;
    switchLabel: string; // visible label of the other language, e.g. "RU"
    switchAria: string;
    gmt: string;
  };
  loader: { word: string; gloss: string; glossNote: string; status: string; left: string; right: string };
  hero: {
    metaLeft: [string, string];
    metaRight: [string, string];
    intro: string;
    introAccent: string;
    scroll: string;
    cursor: string;
    age: string;
    place: string;
  };
  about: {
    label: string;
    aside: string;
    heading: string;
    word: string;
    transcription: string;
    partOfSpeech: string;
    meanings: [string, string];
    statement: string;
    callouts: { k: string; v: string }[];
    cursor: string;
    principlesLabel: string;
    principles: { title: string; text: string }[];
  };
  focus: {
    label: string;
    aside: string;
    title: Accented;
    items: { title: string; text: string; program: Program }[];
    toolkitLabel: string;
    toolkitTitle: Accented;
    homeBase: string;
    groups: { name: string; items: string[]; home?: string[] }[];
  };
  work: {
    label: string;
    aside: string;
    title: Accented;
    intro: string;
    items: { title: string; kind: string; text: string; stack: string[]; link?: { label: string; href: string } }[];
  };
  path: {
    label: string;
    title: Accented;
    intro: string;
    more: string;
    items: { kind: string; title: string; role: string; text: string; highlight?: string }[];
  };
  beyond: {
    label: string;
    aside: string;
    heading: [string, string];
    stickers: { label: string; style: StickerStyle }[];
    sideLabel: string;
    sideTitle: Accented;
    sideIntro: string;
    tracks: { title: string; meta: string; text: string }[];
  };
  contact: {
    label: string;
    aside: string;
    title: [string, string, string];
    button: [string, string];
    soon: string;
    links: { label: string; handle: string; href: string }[];
    marquee: string[];
    marqueeAccent: string;
    rights: string;
    built: string;
    top: string;
  };
};
