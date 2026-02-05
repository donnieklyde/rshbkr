package com.rshbkr.app.model

data class Notification(
    val id: String,
    val content: String,
    val link: String?,
    val isRead: Boolean,
    val type: String,
    val createdAt: String
)

data class NotificationResponse(
    val notifications: List<Notification>
)
