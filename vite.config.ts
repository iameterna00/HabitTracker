import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Add this import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Now this will work!
  ],
})