import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: userId } = await params

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        tracks: true,
                        // followers? slaves?
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const tracks = await prisma.track.findMany({
            where: { artistId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                artist: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                ratings: true, // simplified
                _count: {
                    select: { ratings: true, comments: true }
                }
            }
        })

        // Enhance tracks with stats (similar to feed)
        const enhancedTracks = tracks.map(track => {
            const ratingsCount = track._count.ratings
            const averageScore = ratingsCount > 0
                ? track.ratings.reduce((acc, r) => acc + (
                    (r.feelingStart || 0) + (r.ideaIntent || 0) + (r.soundTexture || 0) +
                    (r.melodyHarmony || 0) + (r.rhythmGroove || 0) + (r.lyrics || 0) +
                    (r.originality || 0) + (r.commitment || 0) + (r.context || 0) +
                    (r.aftertaste || 0)
                ) / 10, 0) / ratingsCount
                : 0

            return {
                ...track,
                stats: {
                    ratingCount: ratingsCount,
                    commentCount: track._count.comments,
                    averageScore: Number(averageScore.toFixed(1))
                },
                ratings: undefined // Hide raw ratings list for bandwidth
            }
        })

        return NextResponse.json({
            user,
            tracks: enhancedTracks
        })

    } catch (error) {
        console.error("Get profile error", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}
