import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

function openBrowserPlugin() {
  return {
    name: 'open-browser',
    configureServer(server: { httpServer?: { once: (e: string, fn: () => void) => void }; config: { server: { port?: number; host?: string | boolean } } }) {
      server.httpServer?.once('listening', () => {
        const port = server.config.server.port ?? 5173
        const host = server.config.server.host === true ? 'localhost' : (server.config.server.host || 'localhost')
        const url = `http://${host}:${port}`
        const cmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`
        exec(cmd, () => {})
        console.log(`\n  ➜  Open in browser: ${url}\n`)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), openBrowserPlugin()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Better code splitting for performance
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('zustand')) {
              return 'zustand-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            // Other node_modules
            return 'vendor';
          }
          // Page chunks for lazy loading
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName) {
              return `page-${pageName}`;
            }
          }
        },
        // Optimize asset file names
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold (4kb)
    assetsInlineLimit: 4096
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion'],
    exclude: []
  }
})
