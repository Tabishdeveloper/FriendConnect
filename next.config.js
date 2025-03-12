/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add experimental features if needed
  experimental: {
    // Enable server actions
    serverActions: true,
  },
  // Improve image optimization
  images: {
    domains: ['commondatastorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig; 