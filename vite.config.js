import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
            // Visual Studio keeps locked index files in .vs, which crashes the file watcher on Windows
            ignored: ['**/.vs/**'],
        },
    },
})