/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Default the whole app to demo mode so it runs with no CV backend.
    // Set NEXT_PUBLIC_DEMO_MODE=false to route through the real provider.
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? "true",
  },
};

export default nextConfig;
