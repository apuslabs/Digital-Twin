import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const twitterApiKey = env.VITE_TWITTERAPI_IO_KEY || env.TWITTERAPI_IO_KEY;

  return {
    base: "",
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Add the server configuration here
    server: {
      allowedHosts: ['digital-twin-mba2.onrender.com'],
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api/twitter': {
          target: 'https://api.twitterapi.io',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/twitter/, ''),
          headers: twitterApiKey
            ? {
                'x-api-key': twitterApiKey,
              }
            : undefined,
        },
      },
    },
    plugins: [tailwindcss()]
  };
});
