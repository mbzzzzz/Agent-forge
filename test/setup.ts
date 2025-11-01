import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock environment variables for tests
import { vi } from 'vitest';

vi.stubEnv('VITE_SUPABASE_URL', 'https://wgltfxvdbxvfypomirza.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-for-testing');

// Cleanup after each test
afterEach(() => {
  cleanup();
});

