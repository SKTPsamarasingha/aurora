import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Add this images block to whitelist your S3 bucket
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '://amazonaws.com',
        port: '',
        pathname: '/**',
      },
           {
              protocol: 'https',
              hostname: 'plus.unsplash.com',
              pathname: '/**', // Allows all image paths from this domain
            },
            {
              protocol: 'https',
              hostname: 'images.unsplash.com', // Added as a best practice for standard Unsplash images
              pathname: '/**',
            },
    ],
  },
};

export default nextConfig;
