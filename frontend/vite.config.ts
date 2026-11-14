import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('postprocessing')) {
              return 'vendor_three';
            }
            if (id.includes('lucide-react')) {
              return 'vendor_icons';
            }
            if (id.includes('motion') || id.includes('gsap') || id.includes('lenis')) {
              return 'vendor_motion';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
