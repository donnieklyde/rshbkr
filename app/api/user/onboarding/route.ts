import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        let { username } = await req.json()

        // Enforce lowercase and remove whitespace
        username = username?.toLowerCase().trim()

        // Strict 3-20 chars, alphanumeric + underscore only
        const usernameRegex = /^[a-z0-9_]{3,20}$/

        if (!username || !usernameRegex.test(username)) {
            return NextResponse.json({ error: "Username must be 3-20 lowercase alphanumeric characters" }, { status: 400 })
        }

        // Check if username exists (now strictly lowercase)
        const existing = await prisma.user.findUnique({
            where: { username }
        })

        if (existing) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 })
        }

        // Update user
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                isOnboarded: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Onboarding Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
