/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.10",
    "192.168.1.103005",
    "192.168.1.21",
    "192.168.1.213005",
    "localhost",
    "localhost3005",
    "127.0.0.1",
    "127.0.0.13005",
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