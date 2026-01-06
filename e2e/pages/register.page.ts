import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly emailInput = this.getByTestId('register-email');
  readonly passwordInput = this.getByTestId('register-password');
  readonly submitButton = this.getByTestId('register-submit');
  readonly errorMessage = this.getByTestId('register-error');
  readonly loginLink = this.getByTestId('register-login-link');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.waitForPageLoad();
  }

  async register(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.page).toHaveURL('/todos');
  }
}
