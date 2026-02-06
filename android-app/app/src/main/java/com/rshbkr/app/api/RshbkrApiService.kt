package com.rshbkr.app.api

import com.rshbkr.app.api.NetworkClient
import com.rshbkr.app.model.NotificationResponse
import com.rshbkr.app.model.RatingResponse
import com.rshbkr.app.model.RatingSubmission
import com.rshbkr.app.model.Track
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface RshbkrApiService {
    @GET("api/feed")
    suspend fun getFeed(): List<Track>
    
    @GET("api/notifications")
    suspend fun getNotifications(): NotificationResponse

    @GET("api/tracks/{id}")
    suspend fun getTrack(@Path("id") id: String): Track

    @GET("api/user/{id}/profile")
    suspend fun getUserProfile(@Path("id") userId: String): Response<NetworkClient.ProfileData>
    
    @POST("api/ratings")
    suspend fun postRating(@Body rating: RatingSubmission): RatingResponse
}
