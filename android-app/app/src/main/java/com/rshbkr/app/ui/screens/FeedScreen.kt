package com.rshbkr.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rshbkr.app.api.NetworkClient
import com.rshbkr.app.model.Track
import com.rshbkr.app.ui.components.SetUsernameDialog

@Composable
fun FeedScreen(
    viewModel: FeedViewModel = viewModel(),
    onTrackClick: (String) -> Unit,
    onLoginClick: () -> Unit,
    onNotificationClick: () -> Unit,
    onProfileClick: (String) -> Unit
) {
    val tracks by viewModel.tracks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    val currentUser by NetworkClient.currentUser.collectAsState()
    var showUsernameDialog by remember { mutableStateOf(false) }

    // Show dialog ONLY if logged in AND not onboarded
    if (currentUser != null && showUsernameDialog) {
        SetUsernameDialog(
            currentUsername = currentUser?.username ?: "",
            onDismiss = { showUsernameDialog = false }, // Consider preventing dismiss if mandatory?
            onUsernameSet = { 
                // Local optimistic update or re-fetch happens via NetworkClient
                showUsernameDialog = false 
            }
        )
    }
    
    // Auto-show dialog if not onboarded
    LaunchedEffect(currentUser) {
        if (currentUser != null && currentUser?.isOnboarded == false) {
            showUsernameDialog = true
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        } else if (error != null) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "Error: $error", color = Color.Red)
                Button(onClick = { viewModel.fetchFeed() }) {
                    Text("Retry")
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "RSHBKR",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Bell only visible if logged in
                            if (currentUser != null) {
                                IconButton(onClick = onNotificationClick) {
                                    // Minimalist Icon using Material Icons or custom path if needed
                                    // Using default outlined bell for minimalism
                                    Icon(
                                        imageVector = androidx.compose.material.icons.Icons.Outlined.Notifications,
                                        contentDescription = "Notifications",
                                        tint = MaterialTheme.colorScheme.onBackground
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                
                                TextButton(onClick = { 
                                    // If NOT onboarded, show dialog
                                    if (currentUser?.isOnboarded == false) {
                                        showUsernameDialog = true 
                                    } else {
                                        // If onboarded, go to profile
                                        currentUser?.id?.let { onProfileClick(it) }
                                    }
                                }) {
                                    Text(
                                        text = currentUser?.username ?: currentUser?.name ?: "User",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            } else {
                                Button(onClick = onLoginClick) {
                                    Text("Login")
                                }
                            }
                        }
                    }
                }

                items(tracks) { track ->
                    TrackCard(track = track, onClick = { onTrackClick(track.id) })
                }
            }
        }
    }
}

@Composable
fun TrackCard(track: Track, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = track.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "@${track.artist.username ?: track.artist.name ?: "unknown"}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = "${track.stats.averageScore}",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
