package com.rshbkr.app.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rshbkr.app.api.NetworkClient
import com.rshbkr.app.model.Track
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class TrackDetailViewModel(private val trackId: String) : ViewModel() {

    private val _track = MutableStateFlow<Track?>(null)
    val track: StateFlow<Track?> = _track.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadTrack()
    }

    fun loadTrack() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _track.value = NetworkClient.apiService.getTrack(trackId)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun submitRating(
        feelingStart: Int,
        ideaIntent: Int,
        soundTexture: Int,
        melodyHarmony: Int,
        rhythmGroove: Int,
        lyrics: Int,
        originality: Int,
        commitment: Int,
        context: Int,
        aftertaste: Int,
        comment: String,
        onResult: (Boolean, String?) -> Unit
    ) {
        viewModelScope.launch {
            try {
                if (_track.value == null) return@launch

                val submission = com.rshbkr.app.model.RatingSubmission(
                    trackId = _track.value!!.id,
                    feelingStart = feelingStart,
                    ideaIntent = ideaIntent,
                    soundTexture = soundTexture,
                    melodyHarmony = melodyHarmony,
                    rhythmGroove = rhythmGroove,
                    lyrics = lyrics,
                    originality = originality,
                    commitment = commitment,
                    context = context,
                    aftertaste = aftertaste,
                    summary = if (comment.isBlank()) null else comment
                )

                val response = NetworkClient.apiService.postRating(submission)
                onResult(response.success, response.error)
            } catch (e: Exception) {
                onResult(false, e.message)
            }
        }
    }
}