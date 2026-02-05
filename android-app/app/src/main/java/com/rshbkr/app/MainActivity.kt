package com.rshbkr.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rshbkr.app.ui.screens.FeedScreen
import com.rshbkr.app.ui.screens.LoginScreen
import com.rshbkr.app.ui.screens.TrackDetailScreen
import com.rshbkr.app.ui.theme.RshbkrTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RshbkrTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    RshbkrApp()
                }
            }
        }
    }
}

@Composable
fun RshbkrApp() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            // Simple Login Button for now if not logged in?
            // Or just put it in the Feed header.
        }
    ) { innerPadding ->
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
                        // In a real app, we'd extract the cookie here and pass it to NetworkClient
                        // For now we assume the WebView flow does the heavy lifting, 
                        // BUT we need to sync that cookie to OkHttp for API calls to work!
                        // That is a critical step. 
                        
                        // Let's navigate back
                        navController.popBackStack()
                    }
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
