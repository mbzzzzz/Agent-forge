import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../services/supabaseClient';

describe('Supabase Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should have Supabase URL configured', () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toContain('supabase.co');
  });

  it('should have Supabase anon key configured', () => {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key.length).toBeGreaterThan(0);
  });

  it('should initialize Supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should be able to get auth session', async () => {
    const { data, error } = await supabase.auth.getSession();
    // Should not throw error even if no session exists
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

