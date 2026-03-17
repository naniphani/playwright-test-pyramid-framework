import {APIRequestContext, expect} from "@playwright/test";

//login to API and return token
export async function loginViaApi(request: APIRequestContext, apiBaseURL: string, email: string, password: string): Promise<string> {
    const response = await request.post(`${apiBaseURL}/users/login`, {
    data: { email, password },
  });
expect(response.status(), "Login API failed").toBe(200);
  
  const body = await response.json();
  return body.access_token;
}

export async function getUserProfile(
  apiContext: APIRequestContext,
  apiBaseURL: string,
  token: string
): Promise<any> {
  const response = await apiContext.get(`${apiBaseURL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status(), "Get Profile API failed").toBe(200);
  return await response.json();
}