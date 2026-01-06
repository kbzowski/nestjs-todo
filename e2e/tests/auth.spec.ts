import { test, expect } from '../fixtures/auth.fixture';

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ registerPage, testUser }) => {
    await registerPage.goto();
    await registerPage.register(testUser.email, testUser.password);
    await registerPage.expectSuccess();
  });

  test('should show error for duplicate email', async ({ registerPage, testUser, page }) => {
    // First registration
    await registerPage.goto();
    await registerPage.register(testUser.email, testUser.password);
    await expect(page).toHaveURL('/todos');

    // Logout and try again
    await page.goto('/register');
    await registerPage.register(testUser.email, testUser.password);
    await registerPage.expectError();
  });

  test('should navigate to login page via link', async ({ registerPage, page }) => {
    await registerPage.goto();
    await registerPage.loginLink.click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('User Login', () => {
  test('should login successfully with valid credentials', async ({
    registerPage,
    loginPage,
    testUser,
  }) => {
    // Register first
    await registerPage.goto();
    await registerPage.register(testUser.email, testUser.password);

    // Logout
    await registerPage.page.goto('/login');

    // Login
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.expectSuccess();
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'WrongPassword123');
    await loginPage.expectError();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/todos');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('User Logout', () => {
  test('should logout successfully', async ({ authenticatedPage, page }) => {
    await authenticatedPage.logout();
    await expect(page).toHaveURL('/login');
  });

  test('should not access protected routes after logout', async ({ authenticatedPage, page }) => {
    await authenticatedPage.logout();
    await page.goto('/todos');
    await expect(page).toHaveURL('/login');
  });
});
