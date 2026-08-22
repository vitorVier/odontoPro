import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Permite que o Next.js converta as fotos para os formatos mais modernos e nítidos do mercado
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      port: '',
      pathname: '/**', 
    }],
    qualities: [100]
  },
};

export default nextConfig;