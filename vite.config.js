import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  "base": "./",
 
  server:{
    port: 8089,
  },
  plugins: [react()],
})