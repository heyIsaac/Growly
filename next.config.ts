import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "drizzle-orm"],
  async redirects() {
    return [
      { source: "/contratar", destination: "/orcamento", permanent: false },
      { source: "/contratar/:path*", destination: "/orcamento", permanent: false },
    ];
  },
};

export default nextConfig;
