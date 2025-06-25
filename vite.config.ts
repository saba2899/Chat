import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public", // ეს ნიშნავს რომ public/_redirects მოხვდება dist-ში
  server: {
    proxy: {
      "/api": "https://serene-waters-93778-60a65ffb64cd.herokuapp.com",
      "/uploads": "https://serene-waters-93778-60a65ffb64cd.herokuapp.com",
    },
  },
});
