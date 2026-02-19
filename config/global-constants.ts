export const GLOBAL = {
    // Centralized app routes used by POMs and tests
    paths: {
        login: "/auth/login",
        account: "/account",
        home: "/"
    },
    // Authenticated browser state files
    storage: {
        customer: "storage/customer.storageState.json"
    }
} as const;
