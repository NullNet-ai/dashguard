import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Unit-test layer for the autonomous triage loop.
// Playwright (playwright.config.ts) owns E2E; this owns pure logic —
// tRPC routers, utils, serializers, hooks.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    // Deliberately NOT globals:true — Cypress ships ambient Chai globals, and a
    // project-wide `expect` collision makes vitest matchers fail typecheck.
    // Test files import { describe, it, expect } from 'vitest' instead.
    globals: false,
    // A ticket may be covered only by Playwright; zero unit tests must not
    // fail the loop's local gate.
    passWithNoTests: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e', 'cypress'],
  },
});
