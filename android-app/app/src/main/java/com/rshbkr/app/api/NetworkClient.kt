package com.rshbkr.app.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object NetworkClient {
    // 10.0.2.2 is the special alias to your host loopback interface (i.e., your development machine's localhost) 
    // from the android emulator.
    // If testing on a real device, you need your machine's local IP or a deployed URL (e.g. https://krappieren.com/)
    private const val BASE_URL = "https://www.rshbkr.com/" 

    // Cookie management
    private val cookieJar = object : okhttp3.CookieJar {
        private val cookieStore = HashMap<String, List<okhttp3.Cookie>>()

        override fun saveFromResponse(url: okhttp3.HttpUrl, cookies: List<okhttp3.Cookie>) {
            cookieStore[url.host] = cookies
            // Log cookies for debugging
            android.util.Log.d("CookieJar", "Saved cookies for ${url.host}: $cookies")
        }

        override fun loadForRequest(url: okhttp3.HttpUrl): List<okhttp3.Cookie> {
            val cookies = cookieStore[url.host] ?: ArrayList()
            android.util.Log.d("CookieJar", "Loaded cookies for ${url.host}: $cookies")
            return cookies
        }
    }

    private val okHttpClient = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    val apiService: RshbkrApiService by lazy {
        val gson = com.google.gson.GsonBuilder()
            .setLenient()
            .create()

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(RshbkrApiService::class.java)
    }
}
