import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'https://agentforge-studio.vercel.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'm.butt0512@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'sxieLhcR7MJPZLk';

test.describe('Content Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Login if not already logged in
    try {
      const authForm = page.getByPlaceholder(/email@example\.com/i);
      if (await authForm.isVisible({ timeout: 2000 })) {
        await authForm.fill(TEST_EMAIL);
        await page.getByPlaceholder(/password/i).fill(TEST_PASSWORD);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(3000); // Wait for login
      }
    } catch (e) {
      // Already logged in or error
    }
  });

  test('should display Brand Kit Manager', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /brand kit manager/i })).toBeVisible();
    await expect(page.getByText(/ai-powered brand identity system/i)).toBeVisible();
  });

  test('should navigate between modules', async ({ page }) => {
    // Click on Mockup Generator
    await page.getByRole('button', { name: /product mockup generator/i }).click();
    await expect(page.getByRole('heading', { name: /product mockup generator/i })).toBeVisible();
    
    // Click on Poster Designer
    await page.getByRole('button', { name: /ai poster designer/i }).click();
    await expect(page.getByRole('heading', { name: /ai poster designer/i })).toBeVisible();
    
    // Click on Social Media Creator
    await page.getByRole('button', { name: /social media creator/i }).click();
    await expect(page.getByText(/content strategy/i)).toBeVisible();
  });

  test('should show validation for Brand Kit input', async ({ page }) => {
    const textarea = page.getByPlaceholder(/eco-friendly coffee shop/i);
    await expect(textarea).toBeVisible();
    
    // Check button is disabled for short input
    const generateButton = page.getByRole('button', { name: /generate full brand kit/i });
    await textarea.fill('short');
    await expect(generateButton).toBeDisabled();
    
    // Fill with valid input
    await textarea.fill('An eco-friendly coffee shop targeting young professionals in urban areas who value sustainability');
    await expect(generateButton).toBeEnabled();
  });

  test('should handle generation error gracefully', async ({ page }) => {
    const textarea = page.getByPlaceholder(/eco-friendly coffee shop/i);
    await textarea.fill('An eco-friendly coffee shop targeting young professionals in urban areas');
    
    await page.getByRole('button', { name: /generate full brand kit/i }).click();
    
    // Wait for either success or error
    await page.waitForTimeout(5000);
    
    // Check for error message or loading state
    const errorVisible = await page.getByText(/failed|error|api key/i).isVisible().catch(() => false);
    const loadingVisible = await page.getByText(/building|generating|loading/i).isVisible().catch(() => false);
    
    expect(errorVisible || loadingVisible).toBeTruthy();
  });

  test('should display Mockup Generator form', async ({ page }) => {
    await page.getByRole('button', { name: /product mockup generator/i }).click();
    
    await expect(page.getByText(/mockup type/i)).toBeVisible();
    await expect(page.getByText(/design description/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /generate mockup/i })).toBeVisible();
  });

  test('should display Poster Designer form', async ({ page }) => {
    await page.getByRole('button', { name: /ai poster designer/i }).click();
    
    await expect(page.getByText(/poster type/i)).toBeVisible();
    await expect(page.getByText(/theme|concept/i)).toBeVisible();
    await expect(page.getByText(/headline text/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /generate poster/i })).toBeVisible();
  });

  test('should display Video Creator form', async ({ page }) => {
    await page.getByRole('button', { name: /ai video creator/i }).click();
    
    // Check for API key selector or video form
    const apiKeySelector = await page.getByText(/api key required/i).isVisible().catch(() => false);
    const videoForm = await page.getByText(/video concept/i).isVisible().catch(() => false);
    
    expect(apiKeySelector || videoForm).toBeTruthy();
  });
});

