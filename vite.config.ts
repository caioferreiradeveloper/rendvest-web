import { loadEnv } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure: (proxy) => {
            const apiOrigin = new URL(apiProxyTarget).origin;
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('origin', apiOrigin);
            });
          },
        },
      },
    },
  };
});
