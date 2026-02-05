import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, description, url } = await req.json()

        if (!url || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const track = await prisma.track.create({
            data: {
                title,
                description,
                fileUrl: url,
                artistId: session.user.id
            }
        })

        return NextResponse.json({ success: true, track })
    } catch (error: any) {
        console.error("Track Creation Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
