import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput = this.getByTestId('login-email');
  readonly passwordInput = this.getByTestId('login-password');
  readonly submitButton = this.getByTestId('login-submit');
  readonly errorMessage = this.getByTestId('login-error');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string): Promise<void> {
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
