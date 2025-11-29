import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';

const originalEnv = process.env;

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn()
}));

describe('lib/supabase/client', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('creates a browser client using environment variables', async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const browserClientMock = { id: 'client-instance' } as const;
    (createBrowserClient as unknown as vi.Mock).mockReturnValue(browserClientMock);

    const { createClient } = await import('./client');
    const client = createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key'
    );
    expect(client).toBe(browserClientMock);
  });

  it('reuses the same browser client instance for subsequent calls', async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const browserClientMock = { id: 'singleton-client' } as const;
    (createBrowserClient as unknown as vi.Mock).mockReturnValue(browserClientMock);

    const { createClient } = await import('./client');
    const first = createClient();
    const second = createClient();

    expect(first).toBe(second);
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
  });
});
