package com.rshbkr.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rshbkr.app.model.Track

@Composable
fun TrackDetailScreen(
    trackId: String,
    onBackClick: () -> Unit
) {
    val viewModel: TrackDetailViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return TrackDetailViewModel(trackId) as T
            }
        }
    )

    val track by viewModel.track.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    if (isLoading || track == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Button(onClick = onBackClick) {
                Text("Back")
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = track!!.title,
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "by ${track!!.artist.username}",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(32.dp))
            
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                 Column(modifier = Modifier.padding(16.dp)) {
                     Text("Score: ${track!!.stats.averageScore}", style = MaterialTheme.typography.headlineMedium)
                     Text("Ratings: ${track!!.stats.ratingCount}")
                 }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            if (track!!.description != null) {
                Text(text = track!!.description!!, style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}
