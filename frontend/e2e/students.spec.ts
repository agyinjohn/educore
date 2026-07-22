import { test, expect } from '@playwright/test';
import { envelope, loginAs } from './fixtures';

const STUDENT = {
  id: 'stu-1',
  school_id: 'school-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  dateOfBirth: '2008-01-01',
  gender: 'F',
  admissionNumber: 'ADM-001',
  enrolmentDate: '2024-01-10',
  status: 'active',
  guardians: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test.describe('Students', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/analytics/dashboard**', (route) => route.fulfill({ json: envelope({ dashboard: {}, lastUpdated: '' }) }));
    await page.route('**/api/v1/notifications/recipient/**', (route) => route.fulfill({ json: envelope([]) }));
    await loginAs(page);
  });

  test('lists students from the cursor-paginated endpoint', async ({ page }) => {
    // Backend shape: {success, data: Student[], cursor, hasMore} — this is
    // exactly the envelope+siblings case the unwrap interceptor has to get
    // right (res.data must end up as the array with .cursor/.hasMore still
    // reachable, not the raw wrapper object).
    await page.route('**/api/v1/students**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      await route.fulfill({ json: envelope([STUDENT], { cursor: null, hasMore: false }) });
    });

    await page.goto('/dashboard/students');
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('ADM-001')).toBeVisible();
    // If unwrapping regressed, this would render the {success,data,...}
    // object where a status badge is expected instead of the real value.
    await expect(page.getByText('active', { exact: true })).toBeVisible();
  });

  test('creates a student and returns to the list', async ({ page }) => {
    await page.route('**/api/v1/students**', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ json: envelope([], { cursor: null, hasMore: false }) });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 201, json: envelope({ ...STUDENT, id: 'stu-2' }) });
      }
      return route.continue();
    });
    await page.route('**/api/v1/academic/classes**', (route) => route.fulfill({ json: envelope([]) }));

    await page.goto('/dashboard/students/new');
    await page.getByLabel(/first name/i).fill('Grace');
    await page.getByLabel(/last name/i).fill('Hopper');
    await page.getByLabel(/date of birth/i).fill('2009-05-15');

    await page.getByRole('button', { name: /create student/i }).click();
    await page.waitForURL('**/dashboard/students');
  });
});
