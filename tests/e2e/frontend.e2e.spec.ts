import { expect, Page, test } from '@playwright/test'

test.describe('Frontend', () => {
  let _page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    _page = await context.newPage()
  })

  test('can go on homepage (nl)', async ({ page }) => {
    await page.goto('http://localhost:25077/nl')
    await expect(page).toHaveTitle(/Lesmaterialen/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Lesmaterialen')
  })

  test('can switch to de', async ({ page }) => {
    await page.goto('http://localhost:25077/de')
    await expect(page).toHaveTitle(/Lesmaterialen|Unterrichtsmaterialien/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(/Unterrichtsmaterialien/)
  })
})
