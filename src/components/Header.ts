import { Page, Locator, expect } from "@playwright/test";

export class Header {
    readonly page: Page;

    readonly userMenu: Locator;
    readonly signOut: Locator;

    constructor(page: Page) {
        this.page = page;

        this.userMenu = page.locator('[data-test="nav-menu"]');
        this.signOut = page.locator('[data-test="nav-sign-out"]');
    }

    async logout() {
        await this.userMenu.click();
        await expect(this.signOut).toBeVisible();
        await this.signOut.click();
    }
}
