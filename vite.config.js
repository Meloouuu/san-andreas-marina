import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' : les fichiers sont chargés en chemins relatifs,
// ce qui permet au site de fonctionner sur GitHub Pages
// (https://ton-pseudo.github.io/san-andreas-marina/).
export default defineConfig({
  plugins: [react()],
  base: './',
});
