import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        console.log('[Auth Callback] Attempting to exchange code for session...');
        console.log('[Auth Callback] Full URL:', request.url);
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[Auth Callback] Code exchange successful, redirecting to:', next);
            // Safely redirect to the exact domain serving this request (handles Vercel gracefully)
            return NextResponse.redirect(new URL(next, request.url))
        } else {
            console.error('[Auth Callback] Error:', error.name, error.message, error)
            // Send the error back to the login page so we can see what actually failed in Vercel
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
        }
    } else {
        console.warn('[Auth Callback] No code provided in URL:', request.url)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
