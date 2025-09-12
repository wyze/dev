import { expect, type Page } from '@playwright/test'

type ListType = 'Basic' | 'Todo' | 'Shopping'

export class ListsPage {
  public title = ''
  public type: ListType = 'Basic'

  constructor(public readonly page: Page) {}

  async first() {
    await this.page.goto('/')
    await this.page
      .getByPlaceholder('What do you want to add?')
      .fill('First item.')

    await this.page.getByRole('button', { name: 'Add Item' }).click()
    await this.page.waitForURL('/lists/*/*')

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

  async changeType(type: ListType) {
    await this.page.getByRole('button', { name: this.type }).click()
    await this.page.getByRole('menuitemcheckbox', { name: type }).click()
    await expect(this.page.getByRole('button', { name: type })).toBeVisible()
    await this.page.getByRole('button', { name: type }).click()

    this.type = type
  }
}
