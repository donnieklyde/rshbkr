package com.rshbkr.app.model

data class RatingSubmission(
    val trackId: String,
    val feelingStart: Int,
    val ideaIntent: Int,
    val soundTexture: Int,
    val melodyHarmony: Int,
    val rhythmGroove: Int,
    val lyrics: Int,
    val originality: Int,
    val commitment: Int,
    val context: Int,
    val aftertaste: Int,
    val summary: String? = null
)

data class RatingResponse(
    val success: Boolean,
    val error: String?
)
