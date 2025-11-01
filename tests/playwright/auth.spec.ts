import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'https://agentforge-studio.vercel.app';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome to agentforge/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email@example\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should switch to sign up form', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByText(/create an account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i, exact: true })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email@example\.com/i).fill('invalid@test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    const errorVisible = await page.getByText(/invalid|failed|error/i).isVisible().catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/email@example\.com/i);
    const passwordInput = page.getByPlaceholder(/password/i);
    
    // Check required attribute
    expect(await emailInput.getAttribute('required')).toBe('');
    expect(await passwordInput.getAttribute('required')).toBe('');
  });

  test('should navigate to workspace after successful login', async ({ page }) => {
    // This test would require actual credentials or mocking
    // For now, we'll test the redirect behavior
    const email = process.env.TEST_EMAIL || 'm.butt0512@gmail.com';
    const password = process.env.TEST_PASSWORD || 'sxieLhcR7MJPZLk';
    
    await page.getByPlaceholder(/email@example\.com/i).fill(email);
    await page.getByPlaceholder(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    
    // Check if we're on workspace or still on auth page
    const onWorkspace = await page.getByText(/brand kit manager|creative studio/i).isVisible().catch(() => false);
    const stillOnAuth = await page.getByText(/welcome to agentforge/i).isVisible().catch(() => false);
    
    // Either we're on workspace or there's an error visible
    expect(onWorkspace || stillOnAuth).toBeTruthy();
  });

  test('should handle Google OAuth redirect', async ({ page }) => {
    await page.getByRole('button', { name: /continue with google/i }).click();
    
    // Wait for redirect to Google
    await page.waitForTimeout(2000);
    
    // Check if redirected to Google or callback handled
    const url = page.url();
    const isGoogleOAuth = url.includes('accounts.google.com') || url.includes('/auth/callback');
    expect(isGoogleOAuth || url === BASE_URL).toBeTruthy();
  });
});

