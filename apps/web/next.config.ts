import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fin-twin/core', '@fin-twin/db'],
};

export default nextConfig;
