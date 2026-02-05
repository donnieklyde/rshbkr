package com.rshbkr.app.api

import com.rshbkr.app.model.Track
import retrofit2.http.GET
import retrofit2.http.Path

interface RshbkrApiService {
    @GET("api/feed")
    suspend fun getFeed(): List<Track>

    @GET("api/tracks/{id}")
    suspend fun getTrack(@Path("id") id: String): Track
}
