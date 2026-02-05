import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL
    const baseUrl = 'https://rshbkr.com'

    // Get all tracks
    const tracks = await prisma.track.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
    })

    // Get all users (for profiles)
    const users = await prisma.user.findMany({
        where: { username: { not: null } },
        select: {
            username: true,
            updatedAt: true
        }
    })

    const trackUrls = tracks.map((track) => ({
        url: `${baseUrl}/track/${track.id}`,
        lastModified: track.updatedAt,
        priority: 0.8,
    }))

    const userUrls = users.map((user) => ({
        url: `${baseUrl}/profile/${user.username}`,
        lastModified: user.updatedAt,
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            priority: 1,
        },
        ...trackUrls,
        ...userUrls
    ]
}
