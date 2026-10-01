import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiPort = process.env.PORT_API || "3003";
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:${apiPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
