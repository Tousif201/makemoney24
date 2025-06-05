import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  extend: {
    keyframes: {
      scroll: {
        "0%": { transform: "translateX(0)" },
        "100%": { transform: "translateX(-50%)" },
      },
    },
    animation: {
      scroll: "scroll 25s linear infinite",
    },
  },
  future: {
    defaultColorFormat: "hex", // This avoids "oklch()" colors for compatibility
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    port:7001,
    allowedHosts:['makemoney24hrs.com','https://makemoney24hrs.com','www.makemoney24hrs.com','http://makemoney24hrs.com','makemoney24.smartchainstudio.in','https://makemoney24.smartchainstudio.in','www.makemoney24.smartchainstudio.in','http://makemoney24.smartchainstudio.in']
  },
  preview:{
    port:7001,
    allowedHosts:['makemoney24hrs.com','https://makemoney24hrs.com','www.makemoney24hrs.com','http://makemoney24hrs.com','makemoney24.smartchainstudio.in','https://makemoney24.smartchainstudio.in','www.makemoney24.smartchainstudio.in','http://makemoney24.smartchainstudio.in']
  },
  
});
