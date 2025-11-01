import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.TEST_URL || 'https://agentforge-studio.vercel.app',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      TEST_EMAIL: process.env.TEST_EMAIL || 'm.butt0512@gmail.com',
      TEST_PASSWORD: process.env.TEST_PASSWORD || 'sxieLhcR7MJPZLk',
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});

