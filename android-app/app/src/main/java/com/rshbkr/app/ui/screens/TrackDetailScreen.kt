package com.rshbkr.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
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
    
    val context = LocalContext.current
    
    // ExoPlayer State
    val exoPlayer = remember {
        androidx.media3.exoplayer.ExoPlayer.Builder(context).build()
    }
    
    // Load track when available
    androidx.compose.runtime.LaunchedEffect(track) {
        track?.fileUrl?.let { url ->
            val mediaItem = androidx.media3.common.MediaItem.fromUri(url)
            exoPlayer.setMediaItem(mediaItem)
            exoPlayer.prepare()
            exoPlayer.play()
        }
    }
    
    // Cleanup on Dispose
    androidx.compose.runtime.DisposableEffect(Unit) {
        onDispose {
            exoPlayer.release()
        }
    }

    if (isLoading || track == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
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
            
            // Audio Controls (Simple Play/Pause for now)
            // In a real app, we'd observe isPlaying state
            Button(
                onClick = {
                    if (exoPlayer.isPlaying) exoPlayer.pause() else exoPlayer.play()
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Play / Pause Audio")
            }
            
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
            
            Spacer(modifier = Modifier.height(32.dp))
            Text("Rate this Track", style = MaterialTheme.typography.titleLarge)
            RatingForm(onSubmit = { f, i, s, m, r, l, o, c, ctx, a ->
                viewModel.submitRating(f, i, s, m, r, l, o, c, ctx, a) { success, err ->
                    // Show toast or snackbar logic handled here or hoisted
                }
            })
        }
    }
}

@Composable
fun RatingForm(
    onSubmit: (Int, Int, Int, Int, Int, Int, Int, Int, Int, Int) -> Unit
) {
    var feelingStart by remember { mutableFloatStateOf(5f) }
    var ideaIntent by remember { mutableFloatStateOf(5f) }
    var soundTexture by remember { mutableFloatStateOf(5f) }
    var melodyHarmony by remember { mutableFloatStateOf(5f) }
    var rhythmGroove by remember { mutableFloatStateOf(5f) }
    var lyrics by remember { mutableFloatStateOf(5f) }
    var originality by remember { mutableFloatStateOf(5f) }
    var commitment by remember { mutableFloatStateOf(5f) }
    var context by remember { mutableFloatStateOf(5f) }
    var aftertaste by remember { mutableFloatStateOf(5f) }

    Column {
        RatingSlider("Feeling / Start", feelingStart) { feelingStart = it }
        RatingSlider("Idea / Intent", ideaIntent) { ideaIntent = it }
        RatingSlider("Sound / Texture", soundTexture) { soundTexture = it }
        RatingSlider("Melody / Harmony", melodyHarmony) { melodyHarmony = it }
        RatingSlider("Rhythm / Groove", rhythmGroove) { rhythmGroove = it }
        RatingSlider("Lyrics", lyrics) { lyrics = it }
        RatingSlider("Originality", originality) { originality = it }
        RatingSlider("Commitment", commitment) { commitment = it }
        RatingSlider("Context", context) { context = it }
        RatingSlider("Aftertaste", aftertaste) { aftertaste = it }
        
        Button(
            onClick = {
                onSubmit(
                    feelingStart.toInt(), ideaIntent.toInt(), soundTexture.toInt(),
                    melodyHarmony.toInt(), rhythmGroove.toInt(), lyrics.toInt(),
                    originality.toInt(), commitment.toInt(), context.toInt(), aftertaste.toInt()
                )
            },
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
        ) {
            Text("Submit Rating")
        }
        
        // Spacer for scrolling
        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
fun RatingSlider(label: String, value: Float, onValueChange: (Float) -> Unit) {
    Column {
        Text("$label: ${value.toInt()}", style = MaterialTheme.typography.labelSmall)
        Slider(
            value = value,
            onValueChange = onValueChange,
            valueRange = 0f..10f,
            steps = 9
        )
    }
}
