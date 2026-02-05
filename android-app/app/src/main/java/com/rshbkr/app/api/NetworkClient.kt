package com.rshbkr.app.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object NetworkClient {
    // 10.0.2.2 is the special alias to your host loopback interface (i.e., your development machine's localhost) 
    // from the android emulator.
    // If testing on a real device, you need your machine's local IP or a deployed URL (e.g. https://krappieren.com/)
    private const val BASE_URL = "https://rshbkr.com/" 

    val apiService: RshbkrApiService by lazy {
        val gson = com.google.gson.GsonBuilder()
            .setLenient()
            .create()

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(RshbkrApiService::class.java)
    }
}
