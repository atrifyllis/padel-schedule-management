import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const originalEnv = process.env;

const cookieStore = {
  get: vi.fn(),
  set: vi.fn()
};

const createServerClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => createServerClient(...args)
}));

vi.mock('next/headers', () => ({
  cookies: () => cookieStore
}));

describe('lib/supabase/server', () => {
  beforeEach(() => {
    vi.resetModules();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    createServerClient.mockReset();
    createServerClient.mockReturnValue({ auth: {} });
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('configures the server client with cookie handlers', async () => {
    const { createClient } = await import('./server');
    createClient();

    const cookieHandlers = createServerClient.mock.calls[0][2].cookies as {
      get: (name: string) => unknown;
      set: (name: string, value: string, options?: Record<string, unknown>) => void;
      remove: (name: string, options?: Record<string, unknown>) => void;
    };

    cookieStore.get.mockReturnValue({ value: 'token' });
    expect(cookieHandlers.get('sb:token')).toBe('token');

    cookieHandlers.set('sb:token', 'value', { path: '/' });
    expect(cookieStore.set).toHaveBeenCalledWith({ name: 'sb:token', value: 'value', path: '/' });

    cookieHandlers.remove('sb:token', { path: '/' });
    expect(cookieStore.set).toHaveBeenCalledWith({
      name: 'sb:token',
      value: '',
      path: '/',
      expires: new Date(0)
    });
  });

  it('passes Supabase credentials from the environment', async () => {
    const { createClient } = await import('./server');
    createClient();

    const [url, anonKey] = createServerClient.mock.calls[0];
    expect(url).toBe('https://example.supabase.co');
    expect(anonKey).toBe('anon-key');
  });
});
