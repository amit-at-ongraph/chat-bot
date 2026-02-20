import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
      },
    ],
  },

  // In modern Next.js, turbo is a top-level property
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },

  // Hide routes which now deprecated for this project
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/forgot-password",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/reset-password",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
