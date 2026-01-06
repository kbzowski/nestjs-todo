import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TodoListPage extends BasePage {
  readonly addTodoButton = this.getByTestId('add-todo-button');
  readonly todoList = this.getByTestId('todo-list');
  readonly todoListEmpty = this.getByTestId('todo-list-empty');
  readonly logoutButton = this.getByTestId('logout-button');
  readonly userEmail = this.getByTestId('user-email');

  // Modal
  readonly modal = this.getByTestId('modal');
  readonly modalClose = this.getByTestId('modal-close');

  // Form in modal
  readonly todoTitle = this.getByTestId('todo-title');
  readonly todoSubmit = this.getByTestId('todo-submit');

  // Filters
  readonly searchInput = this.getByTestId('todo-search');
  readonly resetFilters = this.getByTestId('todo-reset-filters');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/todos');
    await this.waitForPageLoad();
  }

  async openAddTodoModal(): Promise<void> {
    await this.addTodoButton.click();
    await expect(this.modal).toBeVisible();
  }

  async createTodo(title: string): Promise<void> {
    await this.openAddTodoModal();
    await this.todoTitle.fill(title);
    await this.todoSubmit.click();
    await expect(this.modal).not.toBeVisible();
  }

  getTodoItem(id: number): Locator {
    return this.getByTestId(`todo-item-${id}`);
  }

  getTodoByTitle(title: string): Locator {
    return this.todoList.locator('[data-testid^="todo-item-"]').filter({ hasText: title });
  }

  async editTodoByTitle(title: string): Promise<void> {
    const todoItem = this.getTodoByTitle(title);
    const editButton = todoItem.locator('[data-testid^="todo-edit-"]');
    await editButton.click();
  }

  async deleteTodoByTitle(title: string): Promise<void> {
    const todoItem = this.getTodoByTitle(title);
    const deleteButton = todoItem.locator('[data-testid^="todo-delete-"]');
    await deleteButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(400); // debounce
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL('/login');
  }

  async expectTodoCount(count: number): Promise<void> {
    const items = this.todoList.locator('[data-testid^="todo-item-"]');
    await expect(items).toHaveCount(count);
  }

  async expectEmptyList(): Promise<void> {
    await expect(this.todoListEmpty).toBeVisible();
  }

  async expectTodoVisible(title: string): Promise<void> {
    await expect(this.getTodoByTitle(title)).toBeVisible();
  }

  async expectTodoNotVisible(title: string): Promise<void> {
    await expect(this.getTodoByTitle(title)).not.toBeVisible();
  }
}
