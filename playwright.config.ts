import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4174/Gift-for-Soemeone/",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "npm run preview -- --port 4174 --strictPort --base /Gift-for-Soemeone/",
    url: "http://127.0.0.1:4174/Gift-for-Soemeone/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        },
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
