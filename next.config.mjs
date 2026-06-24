/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type checking is now enforced at build time (tsc passes clean).
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail production builds on lint warnings; run `npm run lint` separately.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
}

export default nextConfig
