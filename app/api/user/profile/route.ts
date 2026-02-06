import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
    const session = await auth()

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { username } = await req.json()

        if (!username || username.length < 3) {
            return NextResponse.json({ error: "Invalid username" }, { status: 400 })
        }

        // Check if username taken
        const existing = await prisma.user.findUnique({
            where: { username }
        })

        if (existing && existing.id !== session.user.id) {
            return NextResponse.json({ error: "Username taken" }, { status: 409 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                isOnboarded: true
            }
        })

        return NextResponse.json({ user: updatedUser })

    } catch (error) {
        console.error("Profile update error", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
