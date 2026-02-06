package com.rshbkr.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rshbkr.app.ui.screens.FeedScreen
import com.rshbkr.app.ui.screens.LoginScreen
import com.rshbkr.app.ui.screens.NotificationScreen
import com.rshbkr.app.ui.screens.TrackDetailScreen
import com.rshbkr.app.ui.theme.RshbkrTheme

class MainActivity : ComponentActivity() {
    private var isLoggedIn by mutableStateOf(false)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check if opened via deep link (OAuth callback)
        handleDeepLink(intent)
        
        setContent {
            RshbkrTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    RshbkrApp(
                        isLoggedIn = isLoggedIn,
                        onLoginSuccess = { isLoggedIn = true }
                    )
                }
            }
        }
    }
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        intent?.data?.let { uri ->
            if (uri.scheme == "rshbkr" && uri.host == "callback") {
                // Successfully returned from OAuth
                isLoggedIn = true
            }
        }
    }
}

@Composable
fun RshbkrApp(
    isLoggedIn: Boolean,
    onLoginSuccess: () -> Unit
) {
    val navController = rememberNavController()

    Scaffold { innerPadding ->
        NavHost(
            navController = navController, 
            startDestination = "feed",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("feed") {
                FeedScreen(
                    onTrackClick = { trackId ->
                        navController.navigate("track/$trackId")
                    },
                    onLoginClick = {
                        navController.navigate("login")
                    },
                    onNotificationClick = {
                        navController.navigate("notifications")
                    }
                )
            }
            composable("login") {
                LoginScreen(
                    onLoginSuccess = {
                        onLoginSuccess()
                        navController.popBackStack()
                    }
                )
            }
            composable("notifications") {
                NotificationScreen(
                    onBackClick = { navController.popBackStack() }
                )
            }
            composable("track/{trackId}") { backStackEntry ->
                val trackId = backStackEntry.arguments?.getString("trackId") ?: return@composable
                TrackDetailScreen(
                    trackId = trackId,
                    onBackClick = { navController.popBackStack() }
                )
            }
        }
    }
}
