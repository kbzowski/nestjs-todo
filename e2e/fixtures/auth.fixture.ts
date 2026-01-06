import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { TodoListPage } from '../pages/todo-list.page';
import { TodoDetailPage } from '../pages/todo-detail.page';

type TestFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  todoListPage: TodoListPage;
  todoDetailPage: TodoDetailPage;
  testUser: { email: string; password: string };
  authenticatedPage: TodoListPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  todoListPage: async ({ page }, use) => {
    await use(new TodoListPage(page));
  },

  todoDetailPage: async ({ page }, use) => {
    await use(new TodoDetailPage(page));
  },

  testUser: async ({}, use) => {
    const timestamp = Date.now();
    await use({
      email: `test-${timestamp}@example.com`,
      password: 'TestPassword123',
    });
  },

  // Fixture that registers and logs in a test user
  authenticatedPage: async ({ page, testUser }, use) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(testUser.email, testUser.password);
    await expect(page).toHaveURL('/todos');

    const todoListPage = new TodoListPage(page);
    await use(todoListPage);
  },
});

export { expect };
