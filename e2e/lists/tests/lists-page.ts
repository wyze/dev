import { expect, type Locator, type Page } from '@playwright/test'

export class ListsPage {
  public title = ''

  constructor(public readonly page: Page) {}

  async first() {
    await this.page.goto('/')
    await this.page
      .getByPlaceholder('What do you want to add?')
      .fill('First item.')

    await this.page.getByRole('button', { name: 'Add Item' }).click()
    await this.page.waitForURL('/lists/*')

    const slot = this.page.locator('[data-slot=card-title]')

    this.title = `${await slot.textContent()}`
  }

  async add(item: string) {
    await this.page.getByPlaceholder('Add new item...').fill(item)
    await this.page.getByRole('button', { name: 'Add item' }).click()
    await expect(
      this.page.getByText('The item has been added to the list.'),
    ).toBeVisible()
  }
}
