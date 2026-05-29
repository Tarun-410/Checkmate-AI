/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Stockfish WASM to be served as a static asset
  // Allows worker files from the public directory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Required for chess.js and stockfish WASM in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },

  // Allow cross-origin requests from fonts
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'require-corp',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
      ],
    },
  ],
};

export default nextConfig;
