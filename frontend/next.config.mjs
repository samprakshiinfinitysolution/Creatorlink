/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["10.255.135.175:3005", "10.255.135.175", "localhost:3005"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;




