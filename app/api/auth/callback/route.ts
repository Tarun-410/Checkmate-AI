// Supabase Auth callback route — handles OAuth and magic link redirects
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
