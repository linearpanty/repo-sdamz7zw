import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/repo-sdamz7zw/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              debugName: 'lexicon-chunks',
              name(moduleId) {
                const m = moduleId.match(/src\/data\/chunks\/(chunk\d+)\.ts$/)
                return m ? `lexicon-${m[1]}` : null
              },
            },
          ],
        },
      },
    },
  },
})
