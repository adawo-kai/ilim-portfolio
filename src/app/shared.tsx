import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import type { Dict } from "@/content/types";
import { site } from "@/content/site";

export const viewport: Viewport = { themeColor: "#0b0b0c", colorScheme: "dark" };

export function buildMetadata(dict: Dict, path: "/" | "/ru"): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: site.name,
    authors: [{ name: site.name }],
    creator: site.name,
    keywords: ["Ilim Alisherov", "developer", "Bishkek", "Kyrgyzstan", "Java", "Spring Boot", "Next.js", "AI", "creative coding", "portfolio"],
    alternates: { canonical: path, languages: { en: "/", ru: "/ru" } },
    openGraph: {
      type: "profile",
      url: path,
      siteName: site.name,
      title: dict.meta.ogTitle,
      description: dict.meta.description,
      locale: dict.meta.locale,
      firstName: site.firstName,
      lastName: site.lastName,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: dict.meta.ogTitle, description: dict.meta.description },
    robots: { index: true, follow: true },
  };
}

function jsonLd(dict: Dict) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: "Developer",
    description: dict.meta.description,
    address: { "@type": "PostalAddress", addressLocality: "Bishkek", addressCountry: "KG" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Ala-Too College" },
    sameAs: [site.github, site.telegram],
    knowsAbout: ["Java", "Spring Boot", "React", "Next.js", "Artificial Intelligence", "Creative coding"],
  };
}

/** <html>/<body> shell shared by the English and Russian root layouts. */
export function RootShell({ dict, fontClass, children }: { dict: Dict; fontClass: string; children: ReactNode }) {
  return (
    <html lang={dict.lang} className={fontClass}>
      <body>
        <a href="#main" className="sr-only-focusable label fixed top-3 left-3 z-[200] bg-paper px-3 py-2 text-ink">
          {dict.a11y.skip}
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(dict)) }} />
      </body>
    </html>
  );
}
