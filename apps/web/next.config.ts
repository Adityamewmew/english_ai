import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@english-ai/shared"],
  poweredByHeader: false,
  output: process.platform === "win32" ? undefined : "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/curriculum",
        destination: "/modules",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // CRITICAL: Server-side rewrite MUST ALWAYS target local Elysia port (127.0.0.1:3003)
    // NEVER use NEXT_PUBLIC_API_URL here: if set to the public domain (e.g. https://eddys.drimland.my.id),
    // Next.js will self-proxy in an infinite recursive HTTP loop, pegging CPU to 100%!
    let internalUrl =
      process.env.INTERNAL_API_URL ||
      process.env.API_URL ||
      `http://127.0.0.1:${process.env.PORT_API || "3003"}`;

    if (internalUrl.includes("eddys.drimland.my.id") || internalUrl.startsWith("https://")) {
      internalUrl = `http://127.0.0.1:${process.env.PORT_API || "3003"}`;
    }

    const apiUrl = internalUrl.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
