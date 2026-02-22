import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        console.log('[Auth Callback] Attempting to exchange code for session...');
        console.log('[Auth Callback] Full URL:', request.url);

        let response = NextResponse.redirect(new URL(next, request.url))
        // Remove code from redirect to prevent loops
        response.headers.get('Location') && response.headers.set('Location', response.headers.get('Location')!.replace(/code=[^&]+&?/, ''))

        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            // 1. Set in Next.js cookie store for immediate SSR reads
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                            // 2. VERY IMPORTANT: Also set on the actual HTTP response 
                            // This ensures Vercel Edge actually sends the Set-Cookie header to the browser
                            cookiesToSet.forEach(({ name, value, options }) => {
                                response.cookies.set(name, value, options)
                            })
                        } catch (error) {
                            console.error('[Auth Callback] Failed to set cookies', error)
                        }
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[Auth Callback] Code exchange successful, redirecting to:', next);
            return response
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
