import { Page, Locator, expect } from "@playwright/test";

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

        // Prefer stable attributes; snapshot shows these are accessible textboxes/combobox
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

    async assertLoaded() {
        await expect(this.submit).toBeVisible();
        await expect(this.firstName).toBeVisible();
    }

    async register(user: {
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
            countryLabel: string; // e.g. "United States of America (the)"
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

        await this.submit.click();
    }
}
