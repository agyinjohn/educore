import { Page } from '@playwright/test';

// The frontend never verifies the JWT signature client-side (only the
// backend does) — it just base64-decodes the payload to read
// sub/email/role/schoolId (see auth.context.tsx's parseJwt). A
// syntactically-shaped but unsigned token is enough to drive the UI.
export function fakeJwt(payload: Record<string, unknown>): string {
  const b64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url({ iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900, ...payload });
  return `${header}.${body}.fake-signature`;
}

export const TEST_USER = {
  sub: 'user-1',
  email: 'admin@testschool.edu',
  role: 'SCHOOL_ADMIN',
  schoolId: 'school-1',
};

// Every backend service wraps responses as {success, data, ...rest} —
// apiClient's interceptor unwraps this centrally, so mocks must return the
// real enveloped shape to actually exercise that unwrapping logic (this is
// deliberate: it's the exact bug class fixed in this codebase — API mocks
// that skip the envelope would pass even if unwrapping broke again).
export function envelope(data: unknown, rest: Record<string, unknown> = {}) {
  return { success: true, data, ...rest };
}

// Logs a user in via localStorage + a mocked /auth/login, the same way the
// real login flow ends up populating auth state, without driving the login
// form for tests that don't care about that flow specifically.
export async function loginAs(page: Page, user = TEST_USER) {
  const token = fakeJwt(user);
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({ json: envelope({ accessToken: token, user: { id: user.sub, email: user.email, role: user.role, schoolId: user.schoolId } }) });
  });
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill('Password123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard');
}
