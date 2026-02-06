import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    // Simple check: if logged in but not onboarded, and not ON the onboarding page (or api), redirect.
    // NOTE: 'isOnboarded' needs to be present in the session object. 
    // If we can't get it reliable in middleware (due to edge runtime database limits without edge-compatible adapter or jwt), 
    // we might have to rely on the client or a layout check. 
    // However, with NextAuth v5, 'auth' wrapper gives us the session.

    // Let's assume session has the property because we added it in auth.ts callback.
    const isOnboarded = (req.auth?.user as any)?.isOnboarded;
    const isOnboardingPage = nextUrl.pathname === '/onboarding';
    const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
    const isApiOnboarding = nextUrl.pathname.startsWith('/api/user/onboarding');
    const isPublic = nextUrl.pathname.startsWith('/public') || nextUrl.pathname.startsWith('/_next');

    if (isApiAuth || isPublic || isApiOnboarding) {
        return NextResponse.next();
    }

    // Allow mobile app deep link redirects
    const callbackUrl = nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl?.startsWith('rshbkr://')) {
        return NextResponse.redirect(callbackUrl);
    }

    // Previous redirect logic removed to allow modal-based onboarding on the main page.

    return NextResponse.next();
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Exclude standard static paths
}
