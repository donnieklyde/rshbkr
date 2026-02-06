package com.rshbkr.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rshbkr.app.api.NetworkClient
import com.rshbkr.app.model.Track
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val _profileState = MutableStateFlow<NetworkClient.ProfileData?>(null)
    val profileState = _profileState.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    fun loadProfile(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val data = NetworkClient.fetchUserProfile(userId)
            _profileState.value = data
            _isLoading.value = false
        }
    }
}

@Composable
fun ProfileScreen(
    userId: String,
    onBackClick: () -> Unit,
    onTrackClick: (String) -> Unit
) {
    val viewModel: ProfileViewModel = viewModel()
    val profile by viewModel.profileState.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadProfile(userId)
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(profile?.user?.username ?: "Profile") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (profile != null) {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = profile?.user?.name ?: "",
                                style = MaterialTheme.typography.headlineMedium
                            )
                            Text(
                                text = "@${profile?.user?.username ?: ""}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Divider()
                        }
                    }

                    items(profile!!.tracks) { track ->
                        TrackCard(track = track, onClick = { onTrackClick(track.id) })
                    }
                }
            } else {
                Text("User not found", modifier = Modifier.align(Alignment.Center))
            }
        }
    }
}
