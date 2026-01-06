import { test, expect } from '../fixtures/auth.fixture';

test.describe('Create Todo', () => {
  test('should create a new todo successfully', async ({ authenticatedPage }) => {
    const todoTitle = 'Test Todo Item';

    await authenticatedPage.createTodo(todoTitle);
    await authenticatedPage.expectTodoVisible(todoTitle);
  });

  test('should close modal on cancel', async ({ authenticatedPage }) => {
    await authenticatedPage.openAddTodoModal();
    await authenticatedPage.modalClose.click();
    await expect(authenticatedPage.modal).not.toBeVisible();
  });
});

test.describe('Edit Todo', () => {
  const originalTitle = 'Original Todo';
  const updatedTitle = 'Updated Todo';

  test('should navigate to edit page when clicking edit button', async ({
    authenticatedPage,
    page,
  }) => {
    await authenticatedPage.createTodo(originalTitle);
    await authenticatedPage.editTodoByTitle(originalTitle);
    await expect(page).toHaveURL(/\/todos\/\d+/);
  });

  test('should update todo title successfully', async ({
    authenticatedPage,
    todoDetailPage,
    page,
  }) => {
    await authenticatedPage.createTodo(originalTitle);
    await authenticatedPage.editTodoByTitle(originalTitle);

    await todoDetailPage.updateTodo(updatedTitle);

    await expect(page).toHaveURL('/todos');
    await authenticatedPage.expectTodoVisible(updatedTitle);
    await authenticatedPage.expectTodoNotVisible(originalTitle);
  });

  test('should navigate back without saving', async ({
    authenticatedPage,
    todoDetailPage,
    page,
  }) => {
    await authenticatedPage.createTodo(originalTitle);
    await authenticatedPage.editTodoByTitle(originalTitle);

    await todoDetailPage.goBack();

    await expect(page).toHaveURL('/todos');
    await authenticatedPage.expectTodoVisible(originalTitle);
  });
});

test.describe('Delete Todo', () => {
  const todoTitle = 'Todo to Delete';

  test('should delete todo from list page', async ({ authenticatedPage }) => {
    await authenticatedPage.createTodo(todoTitle);
    await authenticatedPage.deleteTodoByTitle(todoTitle);

    await authenticatedPage.page.waitForTimeout(500);
    await authenticatedPage.expectTodoNotVisible(todoTitle);
  });

  test('should delete todo from detail page', async ({
    authenticatedPage,
    todoDetailPage,
    page,
  }) => {
    await authenticatedPage.createTodo(todoTitle);
    await authenticatedPage.editTodoByTitle(todoTitle);

    await todoDetailPage.deleteTodo();

    await expect(page).toHaveURL('/todos');
    await authenticatedPage.expectTodoNotVisible(todoTitle);
  });

  test('should show empty state when all todos deleted', async ({ authenticatedPage }) => {
    const todoTitle = 'Only Todo';
    await authenticatedPage.createTodo(todoTitle);
    await authenticatedPage.deleteTodoByTitle(todoTitle);

    await authenticatedPage.page.waitForTimeout(500);
    await authenticatedPage.expectEmptyList();
  });
});

test.describe('Filter and Search Todos', () => {
  const todos = ['Buy groceries', 'Walk the dog', 'Read a book', 'Buy new shoes'];

  test('should filter todos by search term', async ({ authenticatedPage }) => {
    // Create all todos
    for (const title of todos) {
      await authenticatedPage.createTodo(title);
    }

    await authenticatedPage.search('Buy');

    await authenticatedPage.expectTodoVisible('Buy groceries');
    await authenticatedPage.expectTodoVisible('Buy new shoes');
    await authenticatedPage.expectTodoNotVisible('Walk the dog');
    await authenticatedPage.expectTodoNotVisible('Read a book');
  });

  test('should show empty state for no search results', async ({ authenticatedPage }) => {
    await authenticatedPage.createTodo('Some Todo');
    await authenticatedPage.search('nonexistent');
    await authenticatedPage.expectEmptyList();
  });

  test('should reset filters and show all todos', async ({ authenticatedPage }) => {
    for (const title of todos) {
      await authenticatedPage.createTodo(title);
    }

    await authenticatedPage.search('Buy');
    await authenticatedPage.expectTodoCount(2);

    await authenticatedPage.resetFilters.click();
    await authenticatedPage.page.waitForTimeout(400);

    await authenticatedPage.expectTodoCount(4);
  });
});
