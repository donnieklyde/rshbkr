package com.rshbkr.app.auth

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GoogleAuthManager(private val context: Context) {

    private val credentialManager = CredentialManager.create(context)

    // REPLACE THIS WITH YOUR ACTUAL WEB CLIENT ID FROM GOOGLE CLOUD CONSOLE (NextAuth ID)
    // The user needs to providing this.
    // For now, using a placeholder that needs to be replaced.
    private val WEB_CLIENT_ID = "212210592892-dbltv2dafpo1ga31evhrn7p761gmhpbq.apps.googleusercontent.com"

    suspend fun signIn(): String? = withContext(Dispatchers.IO) {
        try {
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(WEB_CLIENT_ID)
                .setAutoSelectEnabled(false) // Let user choose
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            // We need an Activity context here effectively, but CredentialManager handles it via Context if Activity?
            // Wait, getCredential requires an Activity context or we handle it in UI layer.
            // Let's defer execution to UI layer or pass Activity?
            // Actually, best to return the Request or handle in Composable/Activity.
            // But to simplify, we can accept Activity in the call or constructor.
            // Since this is a helper, let's keep the logic here but caller must provide activity context if not already.
            null // Placeholder - Logic moved to specific function below
        } catch (e: Exception) {
            Log.e("GoogleAuth", "Sign in failed", e)
            null
        }
    }

    // Modern Credential Manager requires Activity to show the bottom sheet
    suspend fun signIn(activity: android.app.Activity): Result<String> {
        try {
            // Generate a nonce (required for security and sometimes to avoid developer errors)
            val nonce = java.util.UUID.randomUUID().toString()
            val hashedNonce = java.security.MessageDigest.getInstance("SHA-256")
                .digest(nonce.toByteArray())
                .joinToString("") { "%02x".format(it) }

            // Using GetGoogleIdOption directly with specific parameters
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false) // Allow selection of any account
                .setServerClientId(WEB_CLIENT_ID)
                .setNonce(hashedNonce) // Set the nonce
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(
                request = request,
                context = activity
            )

            val idToken = handleSignIn(result)
            return if (idToken != null) {
                Result.success(idToken)
            } else {
                Result.failure(Exception("Failed to parse ID Token from credential"))
            }
        } catch (e: GetCredentialException) {
            Log.e("GoogleAuth", "Credential Manager error: ${e.message}")
            // Provide more specific error info if possible
            return Result.failure(e)
        } catch (e: Exception) {
            Log.e("GoogleAuth", "Unknown error", e)
            return Result.failure(e)
        }
    }

    private fun handleSignIn(result: GetCredentialResponse): String? {
        val credential = result.credential
        if (credential is androidx.credentials.CustomCredential && 
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            
            try {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                return googleIdTokenCredential.idToken
            } catch (e: Exception) {
                Log.e("GoogleAuth", "Invalid Google ID Token", e)
            }
        }
        return null
    }
}
