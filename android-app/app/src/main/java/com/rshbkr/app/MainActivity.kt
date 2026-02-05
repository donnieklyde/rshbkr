package com.rshbkr.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rshbkr.app.ui.screens.FeedScreen
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

    NavHost(navController = navController, startDestination = "feed") {
        composable("feed") {
            FeedScreen(
                onTrackClick = { trackId ->
                    navController.navigate("track/$trackId")
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
