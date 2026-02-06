package com.rshbkr.app.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.rshbkr.app.R
import com.rshbkr.app.api.NetworkClient

class NotificationWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // Only poll if user is logged in (User session exists)
            val user = NetworkClient.currentUser.value
            if (user == null) {
                // If not logged in locally, maybe try to check cookie?
                // For now, only optional.
                // Or better, check if we have cookies in CookieJar. But NetworkClient structure makes it hard.
                // Let's assuming polling is only for active app usage or we can rely on cached token.
                // But for pure background, the static object might be reset.
                // Ideally we persist the session token.
                // For this MVP, let's assume it runs when app is in background but alive.
                return Result.success()
            }

            // Fetch notifications
            // We need a method in NetworkClient to fetch unread count or latest
            // Let's assume we implement `fetchUnreadNotifications()`
            // val notifications = NetworkClient.apiService.getNotifications()
            // Check for new ones?
            
            // This is complex without proper last-checked timestamp.
            // Simplified: Just check for ANY unread and if > 0, show generic notification if not shown recently.
            
            // Allow basic implementation:
            // showNotification("You have new updates!", "Check out what's happening on rshbkr.")

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun showNotification(title: String, message: String) {
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "rshbkr_updates"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Rshbkr Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(applicationContext, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with app icon
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        manager.notify(1, notification)
    }
}
