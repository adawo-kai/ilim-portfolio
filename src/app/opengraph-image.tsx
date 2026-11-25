import { ImageResponse } from "next/og";

export const alt = "Ilim Alisherov — developer and computer engineering student from Bishkek";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const rings = Array.from({ length: 11 }, (_, i) => 90 + i * 70);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0c",
          color: "#eceae4",
          padding: "56px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {rings.map((r, i) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 860 - r / 2 + i * 6,
              top: 250 - r / 2 - i * 4,
              width: r,
              height: r * 0.86,
              borderRadius: "50%",
              border: `${i % 5 === 0 ? 2 : 1}px solid ${i < 3 ? "#0e9ad6" : "rgba(236,234,228,0.18)"}`,
            }}
          />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 2, opacity: 0.6 }}>
          <span>PORTFOLIO / 2026</span>
          <span>42.8746° N 74.5698° E</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 300, lineHeight: 0.86, letterSpacing: -6 }}>ILIM</div>
          <div style={{ fontSize: 150, fontWeight: 300, lineHeight: 0.86, letterSpacing: -6 }}>ALISHEROV</div>
          <div style={{ marginTop: 28, fontSize: 28, opacity: 0.75 }}>
            Developer & computer engineering student — Bishkek, Kyrgyzstan
          </div>
        </div>
      </div>
    ),
    size,
  );
}
