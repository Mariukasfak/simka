// Šis failas pažymėtas kaip nenaudojamas.
// Projektas dabar naudoja Next.js vietoj Vite.
// Šis konfigūracijos failas nebenaudojamas ir turėtų būti pašalintas.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})