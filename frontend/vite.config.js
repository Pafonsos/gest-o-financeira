import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    esbuild: {
      jsx: "automatic",
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
          ".jsx": "jsx",
          ".ts": "ts",
          ".tsx": "tsx",
        },
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
              if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('lucide-react')) return 'vendor-ui';
              return undefined;
            }
            return undefined;
          }
        }
      }
    },    server: {
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

