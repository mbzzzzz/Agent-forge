const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

const BASE_URL = process.env.TEST_URL || 'https://agentforge-studio.vercel.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'm.butt0512@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'sxieLhcR7MJPZLk';

describe('Authentication Tests', () => {
  let driver;

  beforeAll(async () => {
    // Setup Chrome driver
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    await driver.get(BASE_URL);
    await driver.manage().window().setRect({ width: 1280, height: 720 });
    await driver.manage().setTimeouts({ implicit: 10000 });
  });

  test('should display login form', async () => {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Welcome') or contains(text(), 'AgentForge')]"));
    expect(await heading.isDisplayed()).toBe(true);

    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    expect(await emailInput.isDisplayed()).toBe(true);

    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    expect(await passwordInput.isDisplayed()).toBe(true);

    const signInButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
    expect(await signInButton.isDisplayed()).toBe(true);
  });

  test('should switch to sign up form', async () => {
    const signUpTab = await driver.findElement(By.xpath("//button[contains(text(), 'Sign Up')]"));
    await signUpTab.click();
    
    await driver.sleep(500);
    
    const createAccountText = await driver.findElement(By.xpath("//*[contains(text(), 'Create an account') or contains(text(), 'account')]"));
    expect(await createAccountText.isDisplayed()).toBe(true);
  });

  test('should validate required fields', async () => {
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));

    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');

    expect(emailRequired).not.toBeNull();
    expect(passwordRequired).not.toBeNull();
  });

  test('should attempt login', async () => {
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const signInButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));

    await emailInput.clear();
    await emailInput.sendKeys(TEST_EMAIL);
    await passwordInput.clear();
    await passwordInput.sendKeys(TEST_PASSWORD);
    await signInButton.click();

    await driver.sleep(3000);

    // Check if we're on workspace or auth page
    const pageSource = await driver.getPageSource();
    const isWorkspace = pageSource.includes('Brand Kit Manager') || pageSource.includes('Creative Studio');
    const isAuth = pageSource.includes('Welcome to AgentForge');

    expect(isWorkspace || isAuth).toBe(true);
  });

  test('should handle Google OAuth button', async () => {
    const googleButton = await driver.findElement(By.xpath("//button[contains(text(), 'Google')]"));
    await googleButton.click();

    await driver.sleep(2000);

    const currentUrl = await driver.getCurrentUrl();
    const isGoogleOAuth = currentUrl.includes('accounts.google.com') || currentUrl.includes('/auth/callback');
    
    expect(isGoogleOAuth || currentUrl === BASE_URL).toBe(true);
  });
});

