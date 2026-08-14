import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fin-twin/core', '@fin-twin/db'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
