# Test Suite Documentation

This directory contains comprehensive automation tests for AgentForge Studio using Playwright, Cypress, and Selenium.

## Test Frameworks

### 1. Playwright Tests
- **Location**: `tests/playwright/`
- **Run**: `npm run test:playwright`
- **UI Mode**: `npm run test:playwright:ui`
- **Headed Mode**: `npm run test:playwright:headed`

**Features:**
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshots and videos on failure
- Fast and reliable

### 2. Cypress Tests
- **Location**: `tests/cypress/`
- **Run**: `npm run test:cypress`
- **Open UI**: `npm run test:cypress:open`

**Features:**
- Interactive test runner
- Time travel debugging
- Automatic screenshots
- Real browser testing

### 3. Selenium Tests
- **Location**: `tests/selenium/`
- **Run**: `npm run test:selenium`

**Features:**
- Cross-browser compatibility
- Standard WebDriver protocol
- Headless mode support

## Test Coverage

### Authentication Tests
- Login form display
- Sign up form switching
- Field validation
- Error handling
- Google OAuth flow

### Generation Tests
- Module navigation
- Form validation
- Content generation flows
- Error state handling
- Loading states

## Environment Variables

Set these in your environment or `.env` file:

```bash
TEST_URL=https://agentforge-studio.vercel.app
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
```

## Running All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run individual test suites
npm run test:playwright
npm run test:cypress
npm run test:selenium
```

## CI/CD Integration

Tests are configured to run in headless mode and are suitable for CI/CD pipelines. Screenshots and videos are automatically captured on failures.

## Test Data

- Test credentials are stored as environment variables
- Mock data can be added in test fixtures
- API responses can be mocked for faster tests

