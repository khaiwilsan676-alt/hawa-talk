/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Next.js images static export ke liye
  },
};

export default nextConfig;
