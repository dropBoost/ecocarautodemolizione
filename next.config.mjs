/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2678400, // 31 giorni
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
