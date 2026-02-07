import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  plugins: [react()],
  esbuild: {\n    jsx: 'automatic',\n    loader: 'jsx',\n    include: /src\/.*\.[jt]sx?$/,\n  },
  optimizeDeps: {\n    esbuildOptions: {\n      loader: {\n        '.js': 'jsx',\n        '.jsx': 'jsx',\n        '.ts': 'ts',\n        '.tsx': 'tsx'\n      },\n    },\n  },
    },
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  };
});


