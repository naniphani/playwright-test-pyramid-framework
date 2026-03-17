import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import { ENVIRONMENTS, resolveEnvName } from "./config/environments.js";
import { GLOBAL } from "./config/global-constants.js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const envName = resolveEnvName(process.env.ENV);

// UI base URL
const uiBaseURL = process.env.BASE_URL || ENVIRONMENTS[envName].baseURL;

// API base URL
const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

const useStorageState =
  (process.env.USE_STORAGE_STATE ?? "false").toLowerCase() === "true";

export default defineConfig({
  testDir: "./tests",

  timeout: 30_000,

  expect: {
    timeout: 7_000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  outputDir: "test-results",

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
        title: "Playwright Enterprise Test Execution Report",
      },
    ],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
  ],

  // Shared settings for all projects
  use: {
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "retain-on-failure",
  actionTimeout: 10_000,
  navigationTimeout: 15_000,
},

  projects: [
    {
      name: "ui-chromium",
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: uiBaseURL,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
        storageState: useStorageState
          ? "storage/state/customer.json"
          : undefined,
      },
      metadata: {
        testLayer: "ui",
        browser: "chromium",
        app: "practice-software-testing",
        env: envName,
        apiBaseURL,
      },
    },

    {
      name: "api",
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
      metadata: {
        testLayer: "api",
        env: envName,
        apiBaseURL,
      },
    },

    {
      name: "hybrid",
      testMatch: /tests\/hybrid\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: uiBaseURL,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
        storageState: useStorageState
          ? "storage/state/customer.json"
          : undefined,
      },
      metadata: {
        testLayer: "hybrid",
        browser: "chromium",
        app: "practice-software-testing",
        env: envName,
        apiBaseURL,
      },
    },

    // Uncomment later when you want multi-browser UI CI
    // {
    //   name: "ui-firefox",
    //   testMatch: /tests\/ui\/.*\.spec\.ts/,
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     baseURL: uiBaseURL,
    //     extraHTTPHeaders: {
    //       Accept: "application/json",
    //     },
    //     storageState: useStorageState
    //       ? "storage/state/customer.json"
    //       : undefined,
    //   },
    //   metadata: {
    //     testLayer: "ui",
    //     browser: "firefox",
    //     app: "practice-software-testing",
    //     env: envName,
    //     apiBaseURL,
    //   },
    // },
    // {
    //   name: "ui-webkit",
    //   testMatch: /tests\/ui\/.*\.spec\.ts/,
    //   use: {
    //     ...devices["Desktop Safari"],
    //     baseURL: uiBaseURL,
    //     extraHTTPHeaders: {
    //       Accept: "application/json",
    //     },
    //     storageState: useStorageState
    //       ? "storage/state/customer.json"
    //       : undefined,
    //   },
    //   metadata: {
    //     testLayer: "ui",
    //     browser: "webkit",
    //     app: "practice-software-testing",
    //     env: envName,
    //     apiBaseURL,
    //   },
    // },
  ],
});