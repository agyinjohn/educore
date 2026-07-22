import { test, expect } from '@playwright/test';
import { envelope, loginAs } from './fixtures';

const CLASS = {
  id: 'class-1',
  school_id: 'school-1',
  name: 'Grade 10',
  section: 'A',
  academicYear: '2025-2026',
  capacity: 30,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test.describe('Classes', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/analytics/dashboard**', (route) => route.fulfill({ json: envelope({ dashboard: {}, lastUpdated: '' }) }));
    await page.route('**/api/v1/notifications/recipient/**', (route) => route.fulfill({ json: envelope([]) }));
    await loginAs(page);
  });

  test('lists classes for the selected academic year', async ({ page }) => {
    await page.route('**/api/v1/academic/classes**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      await route.fulfill({ json: envelope([CLASS]) });
    });

    await page.goto('/dashboard/classes');
    await expect(page.getByRole('heading', { name: 'Classes' })).toBeVisible();
    await expect(page.getByText('Grade 10 - A')).toBeVisible();
    await expect(page.getByText('2025-2026')).toBeVisible();
  });

  test('shows an empty state when there are no classes yet', async ({ page }) => {
    await page.route('**/api/v1/academic/classes**', (route) => route.fulfill({ json: envelope([]) }));

    await page.goto('/dashboard/classes');
    await expect(page.getByText(/no classes for/i)).toBeVisible();
  });
});
