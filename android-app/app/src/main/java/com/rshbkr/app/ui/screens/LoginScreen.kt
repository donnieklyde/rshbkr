package com.rshbkr.app.ui.screens

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    val context = LocalContext.current
    // Use standard NextAuth signin without custom callback
    val loginUrl = "https://www.rshbkr.com/api/auth/signin"

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Please sign in to continue")
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            // Open login URL in Chrome Custom Tab
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()
            
            customTabsIntent.launchUrl(context, Uri.parse(loginUrl))
        }) {
            Text("Sign in with Google")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Text("After signing in, tap Back to return to the app", 
            modifier = Modifier.padding(horizontal = 32.dp))
    }
}
