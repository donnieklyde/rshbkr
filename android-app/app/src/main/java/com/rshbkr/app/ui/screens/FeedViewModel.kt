package com.rshbkr.app.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rshbkr.app.api.NetworkClient
import com.rshbkr.app.model.Track
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class FeedViewModel : ViewModel() {

    private val _tracks = MutableStateFlow<List<Track>>(emptyList())
    val tracks: StateFlow<List<Track>> = _tracks.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        fetchFeed()
    }

    fun fetchFeed() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val fetchedTracks = NetworkClient.apiService.getFeed()
                _tracks.value = fetchedTracks
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
