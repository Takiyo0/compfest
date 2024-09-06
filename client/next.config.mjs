/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    experimental: {
        optimizeFonts: false, // Disable font optimization during build
    },
};

export default nextConfig;
