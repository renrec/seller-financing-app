import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/seller-financing-app/',
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
