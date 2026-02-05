
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({ error: "Track ID required" }, { status: 400 })
        }

        const track = await prisma.track.findUnique({
            where: { id },
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
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                image: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!track) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 })
        }

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

        const formattedTrack = {
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
            },
            comments: track.comments.map(c => ({
                id: c.id,
                content: c.content,
                username: c.user.username,
                createdAt: c.createdAt
            }))
        }

        return NextResponse.json(formattedTrack)
    } catch (error) {
        console.error("Error fetching track:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
