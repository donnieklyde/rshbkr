import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { v4 as uuidv4 } from 'uuid'

// Initialize Google Client with the same Client ID as NextAuth
const googleClient = new OAuth2Client(process.env.AUTH_GOOGLE_ID)

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json()

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID Token" }, { status: 400 })
        }

        // 1. Verify the Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.AUTH_GOOGLE_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        const payload = ticket.getPayload()

        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Token Payload" }, { status: 401 })
        }

        const { email, name, picture, sub: providerAccountId } = payload

        // 2. Find or Create User (Sync with NextAuth Logic)
        let user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    image: picture,
                    username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''), // Generate default username
                },
            })
        }

        // 3. Link Account if not exists (Optional but good for consistency)
        const account = await prisma.account.findFirst({
            where: {
                provider: 'google',
                providerAccountId: providerAccountId,
            }
        })

        if (!account) {
            await prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: providerAccountId,
                    access_token: idToken, // We store idToken as access token roughly, or just omit
                    token_type: 'Bearer',
                    scope: 'openid email profile',
                }
            })
        }

        // 4. Create a Session
        // Calculate expiry (e.g. 30 days)
        const expires = new Date()
        expires.setDate(expires.getDate() + 30)

        const sessionToken = uuidv4()

        const session = await prisma.session.create({
            data: {
                sessionToken,
                userId: user.id,
                expires,
            }
        })

        // 5. Return the Session Token
        // The Android app will use this token in the 'authjs.session-token' cookie
        const response = NextResponse.json({
            sessionToken: session.sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                username: user.username,
                isOnboarded: user.isOnboarded
            }
        })

        // Explicitly set the cookie so the Android CookieJar picks it up
        response.cookies.set({
            name: 'authjs.session-token',
            value: sessionToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: expires,
        })

        return response

    } catch (error) {
        console.error("Native Auth Error:", error)
        return NextResponse.json({ error: "Authentication Failed", details: String(error) }, { status: 500 })
    }
}
