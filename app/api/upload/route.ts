import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const title = formData.get("title") as String
        const description = formData.get("description") as String

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        if (!file.type.startsWith('audio/')) {
            return NextResponse.json({ error: "File must be an audio file" }, { status: 400 })
        }

        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        });

        // Create Track in DB
        const track = await prisma.track.create({
            data: {
                title: title?.toString() || "Untitled",
                description: description?.toString(),
                fileUrl: blob.url,
                artistId: session.user.id
            }
        })

        return NextResponse.json({ success: true, track })
    } catch (error) {
        console.error("Upload Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
