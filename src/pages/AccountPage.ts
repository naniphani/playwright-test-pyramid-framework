import { Page, Locator, expect } from "@playwright/test";

export class AccountPage {
    readonly page: Page;
    readonly profileLink: Locator;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly email: Locator;
    readonly phone: Locator;
    readonly street: Locator;
    readonly postalCode: Locator;
    readonly city: Locator;
    readonly state: Locator;
    readonly country: Locator;
    readonly updateProfileButton: Locator;
    readonly currentPassword: Locator;
    readonly newPassword: Locator;
    readonly confirmPassword: Locator;
    readonly changePasswordButton: Locator;
    readonly profileUpdateSuccessMessage: Locator;
    readonly passwordChangeErrorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Replace this with the correct account/profile locator
        this.profileLink = page.locator('[data-test="nav-profile"]');

        this.firstName = page.locator('[data-test="first-name"]');
        this.lastName = page.locator('[data-test="last-name"]');
        this.email = page.locator('[data-test="email"]');
        this.phone = page.locator('[data-test="phone"]');
        this.street = page.locator('[data-test="street"]');
        this.postalCode = page.locator('[data-test="postal_code"]');
        this.city = page.locator('[data-test="city"]');
        this.state = page.locator('[data-test="state"]');
        this.country = page.locator('[data-test="country"]');
        this.updateProfileButton = page.locator('[data-test="update-profile-submit"]');
        this.currentPassword = page.locator('[data-test="current-password"]');
        this.newPassword = page.locator('[data-test="new-password"]');
        this.confirmPassword = page.locator('[data-test="new-password-confirm"]');
        this.changePasswordButton = page.locator('[data-test="change-password-submit"]');
        this.profileUpdateSuccessMessage = this.page.getByText(/your profile is successfully updated/i);
        this.passwordChangeErrorMessage = this.page.getByText(/new password cannot be the same as current password/i);

    }

    async open() {
        await this.profileLink.click();
        await this.assertLoaded();
    }

    async assertLoaded() {
        await expect(this.firstName).toBeVisible();
        await expect(this.updateProfileButton).toBeVisible();
    }

    async fillProfileForm(data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        street?: string;
        postalCode?: string;
        city?: string;
        state?: string;
        country?: string;
    }) {
        if (data.firstName !== undefined) await this.firstName.fill(data.firstName);
        if (data.lastName !== undefined) await this.lastName.fill(data.lastName);
        if (data.phone !== undefined) await this.phone.fill(data.phone);
        if (data.street !== undefined) await this.street.fill(data.street);
        if (data.postalCode !== undefined) await this.postalCode.fill(data.postalCode);
        if (data.city !== undefined) await this.city.fill(data.city);
        if (data.state !== undefined) await this.state.fill(data.state);
        if (data.country !== undefined) await this.country.fill(data.country);
    }

    async saveProfile() {
        await this.updateProfileButton.click();
    }

  

    

    async fillPasswordForm(currentPassword: string, newPassword: string, confirmPassword: string) {
        await this.currentPassword.fill(currentPassword);
        await this.newPassword.fill(newPassword);
        await this.confirmPassword.fill(confirmPassword);
    }

    async submitPasswordChange() {
        await this.changePasswordButton.click();
    }
}