/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.10",
    "192.168.1.10:3005",
    "192.168.1.21",
    "192.168.1.21:3005",
    "localhost",
    "localhost:3005",
    "127.0.0.1",
    "127.0.0.1:3005",
  ],
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