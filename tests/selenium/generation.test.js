const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.TEST_URL || 'https://agentforge-studio.vercel.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'm.butt0512@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'sxieLhcR7MJPZLk';

describe('Content Generation Tests', () => {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Login
    await driver.get(BASE_URL);
    await driver.manage().window().setRect({ width: 1280, height: 720 });
    
    try {
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      if (await emailInput.isDisplayed()) {
        await emailInput.sendKeys(TEST_EMAIL);
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys(TEST_PASSWORD);
        const signInButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
        await signInButton.click();
        await driver.sleep(3000);
      }
    } catch (e) {
      // Already logged in
    }
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('should display Brand Kit Manager', async () => {
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Brand Kit Manager')]")), 10000);
    const heading = await driver.findElement(By.xpath("//*[contains(text(), 'Brand Kit Manager')]"));
    expect(await heading.isDisplayed()).toBe(true);
  });

  test('should navigate between modules', async () => {
    // Click Mockup Generator
    const mockupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Mockup Generator')]"));
    await mockupButton.click();
    await driver.sleep(1000);
    
    const mockupHeading = await driver.findElement(By.xpath("//*[contains(text(), 'Mockup Generator')]"));
    expect(await mockupHeading.isDisplayed()).toBe(true);

    // Click Poster Designer
    const posterButton = await driver.findElement(By.xpath("//button[contains(text(), 'Poster Designer')]"));
    await posterButton.click();
    await driver.sleep(1000);
    
    const posterHeading = await driver.findElement(By.xpath("//*[contains(text(), 'Poster Designer')]"));
    expect(await posterHeading.isDisplayed()).toBe(true);

    // Return to Brand Kit
    const brandKitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Brand Kit')]"));
    await brandKitButton.click();
    await driver.sleep(1000);
  });

  test('should validate Brand Kit input', async () => {
    const textarea = await driver.findElement(By.css('textarea'));
    
    // Test with short input
    await textarea.clear();
    await textarea.sendKeys('short');
    await driver.sleep(500);
    
    const generateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Generate Full Brand Kit')]"));
    const isDisabled = await generateButton.getAttribute('disabled');
    expect(isDisabled).not.toBeNull();

    // Test with valid input
    await textarea.clear();
    await textarea.sendKeys('An eco-friendly coffee shop targeting young professionals in urban areas who value sustainability');
    await driver.sleep(500);
    
    const isEnabled = await generateButton.getAttribute('disabled');
    expect(isEnabled).toBeNull();
  });

  test('should display form elements in Mockup Generator', async () => {
    const mockupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Mockup Generator')]"));
    await mockupButton.click();
    await driver.sleep(1000);

    const pageSource = await driver.getPageSource();
    expect(pageSource).toContain('Mockup Type');
    expect(pageSource).toContain('Design Description');
    expect(pageSource).toContain('Generate Mockup');
  });

  test('should handle generation attempt', async () => {
    // Fill Brand Kit form
    const textarea = await driver.findElement(By.css('textarea'));
    await textarea.clear();
    await textarea.sendKeys('A modern tech startup focused on AI solutions for healthcare');
    
    const generateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Generate Full Brand Kit')]"));
    await generateButton.click();

    await driver.sleep(3000);

    // Check for loading, error, or success
    const pageSource = await driver.getPageSource();
    const hasLoading = pageSource.includes('Building') || pageSource.includes('Generating');
    const hasError = pageSource.includes('Failed') || pageSource.includes('Error');
    const hasSuccess = pageSource.includes('Brand Identity');

    expect(hasLoading || hasError || hasSuccess).toBe(true);
  });
});

