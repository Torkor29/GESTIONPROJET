import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Point circulaire sur parchemin — la marque du site. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f3f1",
          borderRadius: 90,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 72,
            background: "#242424",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
