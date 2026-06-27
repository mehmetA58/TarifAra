import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE_PATH is set by CI to /repo-name/ for GitHub Pages.
// Leave unset (default '/') when using a custom domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? '/',
})
