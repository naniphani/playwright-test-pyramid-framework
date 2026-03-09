import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import { ENVIRONMENTS, resolveEnvName } from "./config/environments.js";
import { GLOBAL } from "./config/global-constants.js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const envName = resolveEnvName(process.env.ENV);
const isCI = !!process.env.CI;

const uiBaseURL =
  process.env.BASE_URL || ENVIRONMENTS[envName].baseURL;

const apiBaseURL =
  process.env.API_BASE_URL || ENVIRONMENTS[envName].apiBaseURL;

const useStorageState =
  (process.env.USE_STORAGE_STATE ?? "false").toLowerCase() === "true";

const browserDefaults = {
  browserName: "chromium" as const,
  channel: "chrome",
  baseURL: uiBaseURL,
  viewport: { width: 1440, height: 900 },
  headless: true,
  trace: "on-first-retry" as const,
  screenshot: "only-on-failure" as const,
  video: "retain-on-failure" as const,
  actionTimeout: 10_000,
  navigationTimeout: 30_000,
  ignoreHTTPSErrors: true,
};

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 7_000,
  },

  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  maxFailures: isCI ? 10 : undefined,

  outputDir: "test-results",

  reporter: isCI
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/junit-results.xml" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],

  use: browserDefaults,

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      timeout: 90_000,
      use: {
        ...browserDefaults,
      },
    },

    {
      name: "ui-chromium",
      testMatch: /ui\/.*\.spec\.ts/,
      use: {
        ...browserDefaults,
        storageState: useStorageState ? GLOBAL.storage.customer : undefined,
      },
      dependencies: useStorageState ? ["setup"] : [],
    },

    {
      name: "api",
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },

    {
      name: "hybrid-chromium",
      testMatch: /hybrid\/.*\.spec\.ts/,
      use: {
        ...browserDefaults,
        storageState: useStorageState ? GLOBAL.storage.customer : undefined,
      },
      dependencies: useStorageState ? ["setup"] : [],
    },
  ],
});