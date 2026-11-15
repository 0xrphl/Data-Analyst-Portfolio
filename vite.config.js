import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Guarantees gitignored local Arduino `secrets.h` files inside `public/` are never copied into `dist/` builds
function stripFirmwareSecretsPlugin() {
  return {
    name: 'strip-firmware-secrets',
    closeBundle() {
      const target = resolve(__dirname, 'dist/college/iot-vehicle-telemetry/firmware/main/secrets.h')
      if (fs.existsSync(target)) {
        fs.unlinkSync(target)
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stripFirmwareSecretsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        store: resolve(__dirname, 'store.html'),
      },
    },
  },
})

