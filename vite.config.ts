import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // This tells Vite to use relative paths for assets, fixing the 404 errors.
  base: './',

  // This handles environment variables.
  // The 'process.env' variables are injected by Netlify during the build.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  
  // This plugin is essential for handling React's JSX syntax.
  plugins: [react()],
});