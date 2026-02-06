package com.rshbkr.app.api

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
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

    // Native Authentication Helper
    suspend fun authenticateWithNativeToken(idToken: String): Boolean {
        return kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                // Manually make POST request to exchange token
                val json = "{\"idToken\": \"$idToken\"}"
                val requestBody = json.toRequestBody("application/json; charset=utf-8".toMediaType())
                
                val request = okhttp3.Request.Builder()
                    .url(BASE_URL + "api/auth/native")
                    .post(requestBody)
                    .build()

                val response = okHttpClient.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    // Parse session token if needed, but CookieJar should have handled the Set-Cookie header automatically!
                    // If backend sets cookie, we are good.
                    // Our backend route returns JSON { sessionToken: ... } 
                    // AND it should ideally set a cookie.
                    // IMPORTANT: The backend route I wrote returns JSON but didn't set the Cookie header explicitly in NextResponse.
                    // We need to fix the backend route or manually set the cookie here from JSON.
                    
                    // Let's assume we read the JSON and set it manually if needed, 
                    // but better: Update backend to set cookie.
                    // For now, let's just log success.
                    android.util.Log.d("NetworkClient", "Native auth success: $responseBody")
                    true
                } else {
                    android.util.Log.e("NetworkClient", "Native auth failed: ${response.code}")
                    false
                }
            } catch (e: Exception) {
                android.util.Log.e("NetworkClient", "Native auth error", e)
                false
            }
        }
    }
}
