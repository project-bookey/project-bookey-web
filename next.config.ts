import type { NextConfig } from "next";

/**
 * 조회 전용 공개 웹(www.bookey.site).
 * - standalone: Dockerfile 이 .next/standalone 만 담아 작은 이미지로 띄운다.
 * - 이미지는 최적화하지 않는다 — 책 표지·독후감 사진의 출처 호스트가 제각각이라 <img loading="lazy"> 로 그대로 보여 준다(sharp 불필요).
 */
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
