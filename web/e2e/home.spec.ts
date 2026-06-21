import { test, expect } from '@playwright/test'

test.describe('homepage', () => {
  test('renders the hero, sections, work cards and CTAs', async ({ page }) => {
    await page.goto('/')

    // Exactly one H1, with the headline.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('fill your books.')

    // The four anchored sections exist.
    for (const id of ['services', 'work', 'process', 'contact']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1)
    }

    // 11 work cards, first links to coastal-dental.
    const cards = page.locator('a.work-card')
    await expect(cards).toHaveCount(11)
    await expect(cards.first()).toHaveAttribute('href', '/demos/coastal-dental/')

    // Hero primary CTA → Calendly.
    const book = page.getByRole('link', { name: 'Book a free chat' }).first()
    await expect(book).toHaveAttribute('href', /calendly\.com/)

    // Nav anchor updates the URL hash to Contact.
    await page.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/#contact$/)
  })
})
