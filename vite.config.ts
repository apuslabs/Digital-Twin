import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Add the server configuration here
    server: {
      allowedHosts: ['digital-twin-mba2.onrender.com'],
      host: '0.0.0.0',
      port: 5173
    },
    plugins: [tailwindcss()]
  };
});