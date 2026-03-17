import { test, expect } from "@playwright/test";
import { getTestUserCredentials } from "../../../src/helpers/authHelpers.js";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { AccountPage } from "../../../src/pages/AccountPage.js";
import { loginViaApi, getUserProfile } from "../../api/_helpers/profileApi.js";



test.describe("Account Management - Hybrid", () => {
  test.describe.configure({ mode: "serial" });  
  test("logged-in user can update profile fields and changes persist", async ({ page, request }) => {
    // Arrange
    const { email, password } = getTestUserCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.openViaHome();
    await loginPage.login(email, password);

    const accountPage = new AccountPage(page);
    await accountPage.open();

    // create expected profile test data
    const uniqueId = Date.now(); 

    const profileData = {
  firstName: `TestFirst${uniqueId}`,
  lastName: `TestLast${uniqueId}`,
  phone: `555000${uniqueId.toString().slice(-4)}`,
  street: `123 Test St ${uniqueId}`,
  postalCode: "20723",
  city: "Laurel",
  state: "MD",
  country: "US",
};

     
    // Act
    // update first name, last name, phone, and address via UI
    await accountPage.fillProfileForm(profileData);
    await accountPage.saveProfile();
    await page.reload();
    await accountPage.assertLoaded();
    // Assert
    // verify success message or confirmation in UI
    
    // verify updated values remain visible in the form
    await expect(accountPage.firstName).toHaveValue(profileData.firstName);
    await expect(accountPage.lastName).toHaveValue(profileData.lastName);
    await expect(accountPage.phone).toHaveValue(profileData.phone);
    await expect(accountPage.street).toHaveValue(profileData.street);
    await expect(accountPage.postalCode).toHaveValue(profileData.postalCode);
    await expect(accountPage.city).toHaveValue(profileData.city);
    await expect(accountPage.state).toHaveValue(profileData.state);
    await expect(accountPage.country).toHaveValue(profileData.country);
    
    // verify updated profile data persisted via API
const apiBaseURL = process.env.API_BASE_URL!;

const token = await loginViaApi(request, apiBaseURL, email, password);

const profileFromApi = await getUserProfile(request, apiBaseURL, token);

console.log("profileFromApi:", profileFromApi);

console.log("email used in test:", email);

expect(profileFromApi.first_name).toBe(profileData.firstName);
expect(profileFromApi.last_name).toBe(profileData.lastName);
expect(profileFromApi.phone).toBe(profileData.phone);
expect(profileFromApi.address.street).toBe(profileData.street);
    
  });

  test("user cannot reuse current password and is logged out after successful reset", async ({ page, request }) => {
    // Arrange
    // log in via UI
    // navigate to profile page
    // create a unique new password for this run
    const { email, password } = getTestUserCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.openViaHome();
    await loginPage.login(email, password);
    const accountPage = new AccountPage(page);
    await accountPage.open();
    const uniqueId = Date.now();
    const newPassword = `NewPass@${uniqueId}`;
    
    //negative check block: user tries to reuse the current password.

    await accountPage.fillPasswordForm(password, password, password);

    await accountPage.submitPasswordChange();

    // verify invalid attempt did not reset password or log user out
    await expect(accountPage.currentPassword).toBeVisible();
    await expect(accountPage.changePasswordButton).toBeVisible();
    // verify validation error is shown in UI
    //await expect(accountPage.passwordChangeErrorMessage).toBeVisible();

    //positive check block: user resets password with a valid new password

    await accountPage.fillPasswordForm(password, newPassword, newPassword);
    await accountPage.submitPasswordChange();

    // verify success message is shown in UI    
    //await expect(accountPage.profileUpdateSuccessMessage).toBeVisible();

    // verify user is automatically logged out in UI
    await expect(loginPage.email).toBeVisible();
    // verify old password no longer works via API
    const apiBaseURL = process.env.API_BASE_URL!;

    const oldPasswordLoginResponse = await request.post(`${apiBaseURL}/users/login`, {
      data: { email, password },
    });
    expect(oldPasswordLoginResponse.status(), "Old password should not work after reset").toBe(401);
    // verify new password works via API
    const newPasswordLoginResponse = await request.post(`${apiBaseURL}/users/login`, {
      data: { email, password: newPassword },
    });
    expect(newPasswordLoginResponse.status(), "New password should work after reset").toBe(200);

    // Cleanup
    // restore original password if needed and feasible
    // (depends on whether the test environment allows resetting password back via API or UI)
        await loginPage.openViaHome();
    await loginPage.login(email, newPassword);
    await accountPage.open();
    await accountPage.fillPasswordForm(newPassword, password, password);
    await accountPage.submitPasswordChange();
    //verify logged out and old password works again
    await expect(loginPage.email).toBeVisible();
    const restorePasswordLoginResponse = await request.post(`${apiBaseURL}/users/login`, {
      data: { email, password },
    });
    expect(restorePasswordLoginResponse.status(), "Old password should work after restoring").toBe(200);
  });
});