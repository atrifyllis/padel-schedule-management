import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

type AuthClient = {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<void> | void;
  };
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('app/auth/callback route', () => {
  const exchangeCodeForSession = vi.fn();
  const mockedCreateClient = createClient as unknown as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateClient.mockReturnValue({
      auth: { exchangeCodeForSession }
    } satisfies AuthClient);
    exchangeCodeForSession.mockResolvedValue();
  });

  it('exchanges a code and redirects to the provided next path', async () => {
    const request = new Request('https://example.com/auth/callback?code=test-code&next=/dashboard');
    const response = await GET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('test-code');
    expect(response.headers.get('location')).toBe('https://example.com/dashboard');
  });

  it('skips exchange when no code is provided and falls back to root path', async () => {
    const request = new Request('https://example.com/auth/callback');
    const response = await GET(request);

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toBe('https://example.com/');
  });
});
