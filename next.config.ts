import type {NextConfig} from "next";

import {INFINITE_CACHE} from "next/dist/lib/constants";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    dynamicIO: true,
    cacheLife: {
      default: {
        stale: undefined,
        revalidate: INFINITE_CACHE,
        expire: INFINITE_CACHE,
      },
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
