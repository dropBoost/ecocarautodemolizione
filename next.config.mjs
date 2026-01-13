/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swyuqlczsuplabrzhbnj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: "https",
        hostname: "ecocarautodemolizione.it",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
