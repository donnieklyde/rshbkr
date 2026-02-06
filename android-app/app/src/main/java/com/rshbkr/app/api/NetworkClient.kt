package com.rshbkr.app.api

import kotlinx.coroutines.flow.asStateFlow
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

    // User Data Model
    data class User(
        val id: String,
        val email: String,
        val name: String?,
        val image: String?,
        val username: String?,
        val isOnboarded: Boolean = false
    )
    
    data class ProfileData(
        val user: User,
        val tracks: List<com.rshbkr.app.model.Track>
    )

    private val _currentUser = kotlinx.coroutines.flow.MutableStateFlow<User?>(null)
    val currentUser = _currentUser.asStateFlow()

    suspend fun updateUsername(newUsername: String): Boolean {
        return kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                // Assuming we have a session token in cookie or need to pass it? 
                // Native auth cookies are handled by CookieJar automatically.
                val json = "{\"username\": \"$newUsername\"}"
                val requestBody = json.toRequestBody("application/json; charset=utf-8".toMediaType())
                
                val request = okhttp3.Request.Builder()
                    .url(BASE_URL + "api/user/profile") // We need to create/verify this endpoint
                    .put(requestBody) // PUT to update
                    .build()

                val response = okHttpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    // Update local state with FULL user object from server
                    if (responseBody != null) {
                        try {
                            val jsonObject = org.json.JSONObject(responseBody)
                            val userJson = jsonObject.getJSONObject("user")
                            val updatedUser = User(
                                id = userJson.getString("id"),
                                email = userJson.getString("email"),
                                name = if (userJson.has("name")) userJson.getString("name") else null,
                                image = if (userJson.has("image")) userJson.getString("image") else null,
                                username = if (userJson.has("username")) userJson.getString("username") else null,
                                isOnboarded = if (userJson.has("isOnboarded")) userJson.getBoolean("isOnboarded") else false
                            )
                            _currentUser.value = updatedUser
                            return@withContext true
                        } catch (e: Exception) {
                            android.util.Log.e("NetworkClient", "Failed to parse updated user", e)
                        }
                    }
                    true
                } else {
                    false
                }
            } catch (e: Exception) {
                android.util.Log.e("NetworkClient", "Update username failed", e)
                false
            }
        }
    }

    suspend fun fetchUserProfile(userId: String): ProfileData? {
        return kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                val response = apiService.getUserProfile(userId)
                if (response.isSuccessful) {
                    response.body()
                } else {
                    null
                }
            } catch (e: Exception) {
                android.util.Log.e("NetworkClient", "Fetch profile failed", e)
                null
            }
        }
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
                    // Parse User data from response
                    if (responseBody != null) {
                        try {
                            val jsonObject = org.json.JSONObject(responseBody)
                            val userJson = jsonObject.getJSONObject("user")
                            val user = User(
                                id = userJson.getString("id"),
                                email = userJson.getString("email"),
                                name = if (userJson.has("name")) userJson.getString("name") else null,
                                image = if (userJson.has("image")) userJson.getString("image") else null,
                                username = if (userJson.has("username")) userJson.getString("username") else null,
                                isOnboarded = if (userJson.has("isOnboarded")) userJson.getBoolean("isOnboarded") else false
                            )
                            _currentUser.value = user
                        } catch (e: Exception) {
                            android.util.Log.e("NetworkClient", "Failed to parse user data", e)
                        }
                    }
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

    fun signOut() {
        _currentUser.value = null
        // Clear cookies? CookieJar handles it vaguely, but we can clear the store if exposed
    }
}
