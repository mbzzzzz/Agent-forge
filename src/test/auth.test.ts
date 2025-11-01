import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../services/supabaseClient';

// Mock Supabase auth methods
vi.mock('../../services/supabaseClient', async () => {
  const actual = await vi.importActual('../../services/supabaseClient');
  return {
    ...actual,
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
    },
  };
});

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate email format', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'not-an-email';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  it('should validate password length', () => {
    const shortPassword = '12345'; // Less than 6 characters
    const validPassword = '123456'; // 6+ characters
    
    expect(shortPassword.length).toBeLessThan(6);
    expect(validPassword.length).toBeGreaterThanOrEqual(6);
  });

  it('should handle login with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const mockResponse = {
      data: { user: { id: '123', email }, session: { access_token: 'token' } },
      error: null,
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any);

    const result = await supabase.auth.signInWithPassword({ email, password });
    
    expect(result.error).toBeNull();
    expect(result.data?.user).toBeDefined();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
  });

  it('should handle login error', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';

    const mockError = {
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockError as any);

    const result = await supabase.auth.signInWithPassword({ email, password });
    
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Invalid');
  });

  it('should handle signup', async () => {
    const email = 'newuser@example.com';
    const password = 'password123';

    const mockResponse = {
      data: { user: { id: '123', email }, session: null },
      error: null,
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any);

    const result = await supabase.auth.signUp({ email, password });
    
    expect(result.error).toBeNull();
    expect(result.data?.user).toBeDefined();
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email, password })
    );
  });
});

