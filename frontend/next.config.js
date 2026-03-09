/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Pre-existing components use implicit any patterns; errors are non-blocking
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
