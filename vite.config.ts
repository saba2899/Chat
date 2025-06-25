import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public", // ეს ნიშნავს რომ public/_redirects მოხვდება dist-ში
  server: {
    proxy: {
      "/api": "https://stark-peak-56683-4ee4ea1ccf4b.herokuapp.com/",
      "/uploads": "https://stark-peak-56683-4ee4ea1ccf4b.herokuapp.com/",
    },
  },
});
