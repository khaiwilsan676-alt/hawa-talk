/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out', // Explicitly set output directory to 'out'
  images: {
    unoptimized: true, // Next.js images static export ke liye
  },
};

export default nextConfig;