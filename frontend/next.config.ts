import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'si.geilicdn.com',
        pathname: '**', // allow all image paths
      },
    ],
  },

};

export default nextConfig;
