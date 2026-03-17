export function getTestUserCredentials() {
    const email = process.env.E2E_USER_EMAIL ?? "";
    const password = process.env.E2E_USER_PASSWORD ?? "";

    if (!email || !password) {
        throw new Error("E2E_USER_EMAIL and E2E_USER_PASSWORD environment variables are required for tests.");
    }

    return { email, password };
}