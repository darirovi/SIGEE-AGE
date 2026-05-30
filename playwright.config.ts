import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: './poc/parser-local/tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:7890',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // No webServer here — assume HTTP server is already running on port 7890
    // To run tests with an inline server:
    //   webServer: {
    //     command: 'cd <project-root> && python3 -m http.server 7890',
    //     port: 7890,
    //     reuseExistingServer: true,
    //   },
  },
});
