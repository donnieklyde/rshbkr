package com.rshbkr.app.ui.screens

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.rshbkr.app.auth.GoogleAuthManager
import com.rshbkr.app.api.NetworkClient

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val authManager = remember { GoogleAuthManager(context) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(16.dp))
            Text("Signing in...")
        } else {
            Text("Welcome to rshbkr", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(32.dp))
            
            Button(
                onClick = {
                    scope.launch {
                        isLoading = true
                        errorMessage = null
                        
                        // 1. Native Google Sign-In
                        val result = authManager.signIn(context as Activity)
                        
                        result.onSuccess { idToken ->
                            // 2. Exchange Token with Backend
                            val success = NetworkClient.authenticateWithNativeToken(idToken)
                            if (success) {
                                onLoginSuccess()
                            } else {
                                errorMessage = "Backend authentication failed"
                            }
                        }.onFailure { e ->
                            errorMessage = "Sign-In Error: ${e.message}\n(${e::class.simpleName})"
                        }
                        
                        isLoading = false
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Sign in with Google (Native)")
            }
            
            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(errorMessage!!, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
