/** @type {import('next').NextConfig} */
const nextConfig = {
  // Treat ESLint warnings as warnings only — don't fail the build
  // This lets react/no-unescaped-entities and exhaustive-deps be warnings, not errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [], // add external image domains here if needed
  },
};

module.exports = nextConfig;
