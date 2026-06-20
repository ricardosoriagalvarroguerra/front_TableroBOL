import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El servidor de preview puede asignar un puerto vía la variable de entorno PORT;
// si no, usa 5180. (declare evita depender de @types/node sólo para esto.)
declare const process: { env: Record<string, string | undefined> };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5180,
    host: true,
  },
});
