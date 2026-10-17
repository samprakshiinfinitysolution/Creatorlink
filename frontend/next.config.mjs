/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["10.255.135.175:3005", "10.255.135.175", "localhost:3005"],
  images: {
    minimumCacheTTL: 2592000, // 30 days
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;




