export const TEST_USERS = {
    customer: {
        alias: "customer",
        // email/password must come from env, not stored here
        envEmail: "E2E_USER_EMAIL",
        envPassword: "E2E_USER_PASSWORD"
    }
} as const;
