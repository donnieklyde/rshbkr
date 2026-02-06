import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const callbackUrl = searchParams.get('callbackUrl')

    // If callback URL is the mobile app deep link, redirect to it
    if (callbackUrl?.startsWith('rshbkr://')) {
        return NextResponse.redirect(callbackUrl)
    }

    // Otherwise redirect to home
    return NextResponse.redirect(new URL('/', req.url))
}
