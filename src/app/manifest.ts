import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "신혼생활 · sinhon.life",
    short_name: "신혼생활",
    description: "신혼부부가 함께 쓰는 결혼 가계부·체크리스트·정책 알리미",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#6FB1EA",
    lang: "ko-KR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["lifestyle", "finance"],
  };
}
