import os from "os";

function getLocalDevOrigins() {
  const origins = [
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.20",
    "192.168.1.20:3005",
    "192.168.1.21",
    "192.168.1.21:3005",
    "localhost",
    "localhost:3005",
    "127.0.0.1",
    "127.0.0.1:3005",
    "0.0.0.0",
    "0.0.0.0:3005",
    "192.168.1.10",
    "192.168.1.10:3005",
    "192.168.1.21",
    "192.168.1.21:3005",
  ];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          origins.push(iface.address);
          origins.push(`${iface.address}:3005`);
        }
      }
    }
  } catch {
    // Fallback gracefully
  }
  return Array.from(new Set(origins));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
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
