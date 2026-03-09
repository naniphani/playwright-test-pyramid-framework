export const ENVIRONMENTS: Record<
  string,
  { baseURL: string; apiBaseURL: string }
> = {
  local: {
    baseURL: "http://localhost:4200",
    apiBaseURL: "http://localhost:8091",
  },

  qa: {
    baseURL: "https://practicesoftwaretesting.com",
    apiBaseURL: "https://api.practicesoftwaretesting.com",
  }
};

export function resolveEnvName(
  raw?: string
): keyof typeof ENVIRONMENTS {
  const v = (raw ?? "local").toLowerCase();
  return (v in ENVIRONMENTS ? v : "local") as keyof typeof ENVIRONMENTS;
}