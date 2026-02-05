import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            trackId,
            feelingStart,
            ideaIntent,
            soundTexture,
            melodyHarmony,
            rhythmGroove,
            lyrics,
            originality,
            commitment,
            context,
            aftertaste,
            summary
        } = body

        if (!trackId) {
            return NextResponse.json({ error: "Track ID required" }, { status: 400 })
        }

        const rating = await prisma.rating.upsert({
            where: {
                userId_trackId: {
                    userId: session.user.id,
                    trackId: trackId
                }
            },
            update: {
                feelingStart, ideaIntent, soundTexture, melodyHarmony, rhythmGroove,
                lyrics, originality, commitment, context, aftertaste,
                summary
            },
            create: {
                userId: session.user.id,
                trackId,
                feelingStart, ideaIntent, soundTexture, melodyHarmony, rhythmGroove,
                lyrics, originality, commitment, context, aftertaste,
                summary
            }
        })

        return NextResponse.json({ success: true, rating })
    } catch (error) {
        console.error("Rating Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
