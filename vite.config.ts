import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  ...(mode === 'experience' ? { build: { outDir: 'dist/experience', rollupOptions: { input: 'experience.html' } } } : {}),
}));
