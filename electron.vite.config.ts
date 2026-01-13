import { sentryVitePlugin } from '@sentry/vite-plugin'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    build: {
      sourcemap: true,
      minify: 'terser',
      target: 'node18',
      terserOptions: {
        compress: {
          passes: 2,
          pure_funcs: ['console.log', 'console.debug'],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'lib/main/main.ts'),
        },
        output: {
          manualChunks: undefined,
        },
      },
    },
    resolve: {
      alias: {
        '@/app': resolve(__dirname, 'app'),
        '@/lib': resolve(__dirname, 'lib'),
        '@/resources': resolve(__dirname, 'resources'),
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({ org: 'demox-labs', project: 'ito' }),
    ],
  },

  preload: {
    build: {
      sourcemap: true,
      minify: 'terser',
      target: 'node18',
      terserOptions: {
        compress: {
          passes: 2,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'lib/preload/preload.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@/app': resolve(__dirname, 'app'),
        '@/lib': resolve(__dirname, 'lib'),
        '@/resources': resolve(__dirname, 'resources'),
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({ org: 'demox-labs', project: 'ito' }),
    ],
  },

  renderer: {
    root: './app',
    build: {
      sourcemap: true,
      minify: 'terser',
      target: 'esnext',
      terserOptions: {
        compress: {
          passes: 2,
          drop_console: false,
          pure_funcs: ['console.debug'],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/index.html'),
        },
        output: {
          manualChunks: (id) => {
            // Vendor chunk for node_modules
            if (id.includes('node_modules')) {
              // Split large libraries into separate chunks
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-ui'
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react'
              }
              return 'vendor'
            }
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@/app': resolve(__dirname, 'app'),
        '@/lib': resolve(__dirname, 'lib'),
        '@/resources': resolve(__dirname, 'resources'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@emotion/react', '@mui/material'],
    },
    plugins: [
      tailwindcss(),
      react(),
      sentryVitePlugin({ org: 'demox-labs', project: 'ito' }),
    ],
  },
})
