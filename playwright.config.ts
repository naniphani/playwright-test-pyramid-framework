import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import { ENVIRONMENTS, resolveEnvName } from "./config/environments.js";
import { GLOBAL } from "./config/global-constants.js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const envName = resolveEnvName(process.env.ENV);

// UI base URL (your existing behavior)
const uiBaseURL = process.env.BASE_URL || ENVIRONMENTS[envName].baseURL;

// API base URL (new; defaults to Toolshop API)
const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

const useStorageState =
    (process.env.USE_STORAGE_STATE ?? "false").toLowerCase() === "true";

export default defineConfig({
    testDir: "./tests",
    timeout: 30_000,
    expect: { timeout: 7_000 },

    outputDir: "test-results",
    reporter: [["html", { open: "never" }], ["list"], ["junit", { outputFile: "test-results/results.xml" }]],

    // Global setup to create storageState for authenticated runs
    globalSetup: './scripts/global-setup.ts',

    // Default "use" applies to all projects unless overridden
    use: {
        baseURL: uiBaseURL, // default to UI base URL
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 10_000,
        navigationTimeout: 60_000,
    },

    projects: [
        // Creates storage/customer.storageState.json
        {
            name: "setup",
            testMatch: "**/*.setup.ts",
            timeout: 90_000,
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "hybrid",
            testMatch: "hybrid/**/*.spec.ts",
            use: {
                ...devices["Desktop Chrome"],
            }
        },

        // UI tests
        {
            name: "ui",
            testMatch: [
                "ui/**/*.spec.ts",
                "hybrid/**/*.spec.ts"
            ],
            use: {
                ...devices["Desktop Chrome"],
                storageState: useStorageState ? GLOBAL.storage.customer : undefined
            },
            dependencies: useStorageState ? ["setup"] : []
        },

        // API tests (no browser state)
        {
            name: "api",
            testMatch: "api/**/*.spec.ts",
            use: {
                baseURL: apiBaseURL, // ? API base URL here
                extraHTTPHeaders: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            },
        },
    ],
});
