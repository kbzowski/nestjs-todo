import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TodoDetailPage extends BasePage {
  readonly backLink = this.getByTestId('back-link');
  readonly deleteTodoButton = this.getByTestId('delete-todo-button');
  readonly todoTitle = this.getByTestId('todo-title');
  readonly todoSubmit = this.getByTestId('todo-submit');

  constructor(page: Page) {
    super(page);
  }

  async goto(todoId: number): Promise<void> {
    await this.page.goto(`/todos/${todoId}`);
    await this.waitForPageLoad();
  }

  async updateTodo(newTitle: string): Promise<void> {
    await this.todoTitle.clear();
    await this.todoTitle.fill(newTitle);
    await this.todoSubmit.click();
    await expect(this.page).toHaveURL('/todos');
  }

  async deleteTodo(): Promise<void> {
    await this.deleteTodoButton.click();
    await expect(this.page).toHaveURL('/todos');
  }

  async goBack(): Promise<void> {
    await this.backLink.click();
    await expect(this.page).toHaveURL('/todos');
  }
}
