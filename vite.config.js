import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  server: {
    host: true, // Écoute sur toutes les interfaces réseau
    port: 5173, // Port par défaut
    strictPort: true, // Échoue si le port est déjà utilisé
    open: true // Ouvre automatiquement le navigateur
  }
})
