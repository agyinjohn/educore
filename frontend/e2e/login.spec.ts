import { test, expect } from '@playwright/test';
import { envelope, fakeJwt, TEST_USER } from './fixtures';

test.describe('Login', () => {
  test('signs in and reaches the dashboard', async ({ page }) => {
    const token = fakeJwt(TEST_USER);
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        json: envelope({
          accessToken: token,
          user: { id: TEST_USER.sub, email: TEST_USER.email, role: TEST_USER.role, schoolId: TEST_USER.schoolId },
        }),
      });
    });
    // Sidebar role-gated links and the dashboard's own notification fetch.
    await page.route('**/api/v1/notifications/recipient/**', (route) => route.fulfill({ json: envelope([]) }));
    await page.route('**/api/v1/analytics/dashboard**', (route) => route.fulfill({ json: envelope({ dashboard: { attendance: null, grades: null, enrollment: null, engagement: null }, lastUpdated: new Date().toISOString() }) }));

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    // Confirms the JWT was decoded correctly and the sidebar's role check
    // (uppercase 'SCHOOL_ADMIN', not 'admin') actually renders links.
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible();
  });

  test('shows an error on invalid credentials', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ status: 401, json: { success: false, message: 'Invalid email or password' } });
    });

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nobody@testschool.edu');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid/i).first()).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });
});
