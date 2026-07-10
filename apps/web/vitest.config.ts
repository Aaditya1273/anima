import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // @vitejs/plugin-react handles JSX transform for .tsx files. Required because
  // Next.js tsconfig uses "jsx": "preserve" (leaves JSX as-is for the Next.js
  // compiler), but vitest/Rolldown must transform it themselves.
  plugins: [react()],
  test: {
    // jsdom provides a browser-like environment for React component tests
    environment: 'jsdom',
    // Automatically run setup file before each test file
    setupFiles: ['./test/setup.ts'],
    // Include test files with these patterns
    include: ['**/*.test.{ts,tsx}'],
    // Exclude next.js build artifacts and node_modules
    exclude: ['node_modules', '.next'],
    // Global test utilities available without imports
    globals: true,
    // CSS modules are not needed in tests — skip them for speed
    css: false,
    // Restore all mocks after each test
    mockReset: true,
  },
  resolve: {
    alias: {
      // Match the tsconfig paths: @/* maps to apps/web/*
      '@': path.resolve(__dirname, '.'),
    },
  },
})
