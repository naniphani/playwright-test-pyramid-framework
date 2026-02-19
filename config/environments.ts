export const ENVIRONMENTS: Record<string, { baseURL: string }> = {
    local: { baseURL: "https://practicesoftwaretesting.com" },
    qa: { baseURL: "https://practicesoftwaretesting.com" }
};

export function resolveEnvName(raw?: string): keyof typeof ENVIRONMENTS {
    const v = (raw ?? "local").toLowerCase();
    return (v in ENVIRONMENTS ? v : "local") as keyof typeof ENVIRONMENTS;
}
