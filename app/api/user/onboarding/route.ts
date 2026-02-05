import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { username } = await req.json()

        if (!username || username.length < 3) {
            return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
        }

        // Check if username exists
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
