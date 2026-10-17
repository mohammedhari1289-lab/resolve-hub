import { ImageResponse } from "next/og";

export const alt = "ResolveHub – Complaint Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0c1620", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#0e7c7b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800 }}>R</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>ResolveHub</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 48, lineHeight: 1.05 }}>Every complaint gets an ID, an owner and an answer.</div>
        <div style={{ fontSize: 30, marginTop: 32, color: "#6cc5c1" }}>Submitted → Under Review → In Progress → Resolved → Closed</div>
      </div>
    ),
    size,
  );
}
