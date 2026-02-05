import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const tracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                artist: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                ratings: {
                    select: {
                        feelingStart: true,
                        ideaIntent: true,
                        soundTexture: true,
                        melodyHarmony: true,
                        rhythmGroove: true,
                        lyrics: true,
                        originality: true,
                        commitment: true,
                        context: true,
                        aftertaste: true
                    }
                }
            },
            take: 50 // Limit for mobile feed
        })

        const formattedTracks = tracks.map(track => {
            const ratingCount = track.ratings.length
            let averageScore = 0.0

            if (ratingCount > 0) {
                const totalSum = track.ratings.reduce((acc, r) => {
                    const rSum = (r.feelingStart || 0) +
                        (r.ideaIntent || 0) +
                        (r.soundTexture || 0) +
                        (r.melodyHarmony || 0) +
                        (r.rhythmGroove || 0) +
                        (r.lyrics || 0) +
                        (r.originality || 0) +
                        (r.commitment || 0) +
                        (r.context || 0) +
                        (r.aftertaste || 0)
                    return acc + (rSum / 10)
                }, 0)
                averageScore = totalSum / ratingCount
            }

            return {
                id: track.id,
                title: track.title,
                description: track.description,
                fileUrl: track.fileUrl,
                createdAt: track.createdAt.toISOString(),
                artist: {
                    id: track.artist.id,
                    name: track.artist.name,
                    username: track.artist.username,
                    image: track.artist.image,
                },
                stats: {
                    ratingCount,
                    averageScore: parseFloat(averageScore.toFixed(1))
                }
            }
        })

        return NextResponse.json(formattedTracks)
    } catch (error) {
        console.error("Error fetching feed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
