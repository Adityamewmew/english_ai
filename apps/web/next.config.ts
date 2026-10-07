import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    const apiUrl = rawApiUrl
      ? rawApiUrl.replace(/\/$/, "")
      : `http://localhost:${process.env.PORT_API || "3003"}`;
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
