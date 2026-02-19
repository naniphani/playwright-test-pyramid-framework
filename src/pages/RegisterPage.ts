import { Page, Locator, expect, APIResponse } from "@playwright/test";
import type { Response as PWResponse } from "@playwright/test";
export class RegisterPage {
    readonly page: Page;

    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly dob: Locator;

    readonly street: Locator;
    readonly postalCode: Locator;
    readonly city: Locator;
    readonly state: Locator;
    readonly country: Locator;
    readonly phone: Locator;

    readonly email: Locator;
    readonly password: Locator;

    readonly submit: Locator;

    constructor(page: Page) {
        this.page = page;

        this.firstName = page.getByRole("textbox", { name: /first name/i });
        this.lastName = page.getByRole("textbox", { name: /last name/i });
        this.dob = page.getByRole("textbox", { name: /date of birth/i });

        this.street = page.getByRole("textbox", { name: /street/i });
        this.postalCode = page.getByRole("textbox", { name: /postal code/i });
        this.city = page.getByRole("textbox", { name: /city/i });
        this.state = page.getByRole("textbox", { name: /state/i });
        this.country = page.getByRole("combobox", { name: /country/i });
        this.phone = page.getByRole("textbox", { name: /phone/i });

        this.email = page.getByRole("textbox", { name: /email address/i });
        this.password = page.getByRole("textbox", { name: /^password$/i });

        this.submit = page.getByRole("button", { name: /^register$/i });
    }

    async open() {
        await this.page.goto("/auth/register", { waitUntil: "domcontentloaded" });
        await this.assertLoaded();
    }

    async assertLoaded() {
        await expect(this.submit).toBeVisible();
        await expect(this.firstName).toBeVisible();
    }

    async fillForm(user: {
        firstName: string;
        lastName: string;
        dob: string;
        email: string;
        password: string;
        phone: string;
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            countryLabel: string;
        };
    }) {
        await this.firstName.fill(user.firstName);
        await this.lastName.fill(user.lastName);
        await this.dob.fill(user.dob);

        await this.street.fill(user.address.street);
        await this.postalCode.fill(user.address.postalCode);
        await this.city.fill(user.address.city);
        await this.state.fill(user.address.state);
        await this.country.selectOption({ label: user.address.countryLabel });

        await this.phone.fill(user.phone);
        await this.email.fill(user.email);
        await this.password.fill(user.password);
    }

    /**
     * Click Register and wait for the network response from /users/register.
     * This is the most stable indicator of success/failure in this demo app.
     */
    async submitAndWaitForRegisterResponse() {
        await expect(this.submit).toBeEnabled();
        await this.submit.click();

        try {
            return await this.page.waitForResponse(
                (r) =>
                    r.request().method() === "POST" &&
                    /users/i.test(r.url()) &&
                    /register/i.test(r.url()),
                { timeout: 30_000 }
            );
        } catch {
            // Common Angular validation areas (adjust if your app differs)
            const errors = await this.page
                .locator(".invalid-feedback, .alert-danger, .text-danger")
                .allTextContents()
                .catch(() => []);

            throw new Error(
                `No register API response captured after clicking Register.\n` +
                `URL: ${this.page.url()}\n` +
                `Visible errors: ${errors.filter(Boolean).join(" | ") || "(none found)"}`
            );
        }
    }
}
