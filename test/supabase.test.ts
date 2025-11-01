import { describe, it, expect } from 'vitest';

describe('Supabase Configuration', () => {
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
});

