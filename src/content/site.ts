/**
 * Language-independent facts. Texts live in en.ts / ru.ts.
 * TODO(Ilim): add your LinkedIn URL and the final domain.
 */
export const site = {
  name: "Ilim Alisherov",
  firstName: "Ilim",
  lastName: "Alisherov",
  age: 18,
  timeZone: "Asia/Bishkek",
  coords: { lat: 42.8746, lng: 74.5698 },
  url: "https://ilim-alisherov.vercel.app", // TODO(Ilim): your real domain
  email: "alisherov.ilim99@gmail.com",
  github: "https://github.com/adawo-kai",
  telegram: "https://t.me/adawo_creator",
  instagram3d: "https://www.instagram.com/eree2l/",
  argus: "https://github.com/adawo-kai/B001_Argus_Prototype",
  linkedin: "", // TODO(Ilim): paste your LinkedIn URL — the row shows "soon" while empty
} as const;

/** The GitHub profile README stack, shared by both languages. */
export const stack = {
  backend: ["Java", "Spring Boot", "Node.js", "Express", "Python", "Telegram bots", "MySQL", "PostgreSQL", "Supabase", "SQLite", "Flyway"],
  web: ["TypeScript", "JavaScript", "React", "Next.js", "Astro", "Vite", "Tailwind CSS", "React Native", "Expo", "HTML", "CSS"],
  motion: ["GSAP", "HyperFrames", "Remotion", "Three.js", "Blender", "FFmpeg", "Playwright"],
  ai: ["Claude Code", "MCP", "Whisper", "ElevenLabs", "OpenAI API"],
  ops: ["Docker", "Vercel", "Nginx", "Git", "GitHub Actions", "Maven"],
  home: ["Java", "Spring Boot"],
};
