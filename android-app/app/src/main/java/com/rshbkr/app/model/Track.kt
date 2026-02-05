package com.rshbkr.app.model

data class Track(
    val id: String,
    val title: String,
    val description: String?,
    val fileUrl: String,
    val createdAt: String,
    val artist: Artist,
    val stats: TrackStats
)

data class Artist(
    val id: String,
    val name: String?,
    val username: String?,
    val image: String?
)

data class TrackStats(
    val ratingCount: Int,
    val averageScore: Float
)
