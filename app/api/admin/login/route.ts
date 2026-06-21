import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[admin/login] ADMIN_PASSWORD env var is not set');
      return NextResponse.json(
        { error: 'Admin access is not configured.' },
        { status: 500 }
      );
    }

    if (!password || password !== adminPassword) {
      // Constant-time-ish: always check even if password is missing
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(
      SESSION_COOKIE.name,
      SESSION_COOKIE.value,
      SESSION_COOKIE.options
    );
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
