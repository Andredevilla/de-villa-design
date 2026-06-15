import { test, expect } from '@playwright/test'

// Regression guards for the CSS cascade-layer bug: custom component styles
// must NOT be defeated by the unlayered base reset (a{color:inherit}) or a
// stray container display rule. See globals.css "Glass surfaces" note.
test.describe('critical layout / cascade', () => {
  test('nav pill lays out horizontally (brand + links on one row)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header .nav-pill')).toHaveCSS('display', 'flex')
  })

  test('solid CTA buttons render visible white text, not dark-on-dark', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('header').getByRole('link', { name: 'Book a free chat' }),
    ).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(page.getByRole('link', { name: 'Book a call' })).toHaveCSS('color', 'rgb(255, 255, 255)')
  })
})
