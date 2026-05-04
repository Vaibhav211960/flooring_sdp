import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig(async () => {
  const plugins = [
    react(),
    tailwindcss(),
  ]

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const { cartographer } = await import(
      "@replit/vite-plugin-cartographer"
    )
    const { devBanner } = await import(
      "@replit/vite-plugin-dev-banner"
    )

    plugins.push(cartographer(), devBanner())
  }

  return {
    base: "/",   // ✅ CORRECT PLACE

    plugins,

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    css: {
      postcss: {
        plugins: [],
      },
    },
  }
})