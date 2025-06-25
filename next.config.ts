/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        pathname: "/**", // Allow all paths
      },
      {
        protocol: "https",
        hostname: "cf.bstatic.com",
        pathname: "/**", // Allow all paths
      },
      // Add more patterns as needed
    ],
  },
};

module.exports = nextConfig;
