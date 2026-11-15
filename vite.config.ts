import { loadEnv } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET || 'http://localhost:8000';
  const pageSize = env.PAGE_SIZE?.trim() ?? '';

  if (
    pageSize &&
    (!Number.isSafeInteger(Number(pageSize)) || Number(pageSize) < 1)
  ) {
    throw new Error('PAGE_SIZE deve ser um número inteiro positivo seguro.');
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@components': resolve(srcPath, 'components'),
        '@config': resolve(srcPath, 'config'),
        '@contexts': resolve(srcPath, 'contexts'),
        '@hooks': resolve(srcPath, 'hooks'),
        '@interface': resolve(srcPath, 'interfaces'),
        '@services': resolve(srcPath, 'services'),
        '@pages': resolve(srcPath, 'pages'),
      },
    },
    define: {
      'import.meta.env.VITE_PAGE_SIZE': JSON.stringify(pageSize),
    },
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
