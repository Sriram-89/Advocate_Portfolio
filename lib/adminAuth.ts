import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated'; // simple opaque value

/**
 * Call this at the top of every admin API route handler.
 * Returns true if the request carries a valid admin session cookie.
 *
 * The actual credential check happens in /api/admin/login — this just
 * verifies the cookie that login sets.
 */
export function isAdminAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(COOKIE_NAME);
    return session?.value === SESSION_VALUE;
  } catch {
    return false;
  }
}

/** Returned by the login route to set the session cookie */
export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  value: SESSION_VALUE,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    // 8-hour session
    maxAge: 60 * 60 * 8,
  },
} as const;
