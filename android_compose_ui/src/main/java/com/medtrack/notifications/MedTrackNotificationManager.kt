package com.medtrack.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Handles all notification logic, ensuring loud sounds, vibrations, 
 * and full screen interrupts for medication reminders.
 */
object MedTrackNotificationManager {

    const val CHANNEL_ID = "medtrack_channel"
    private const val NOTIFICATION_ID = 1001

    /**
     * Initializes the High-Priority Notification Channel.
     * Call this in your Application class or MainActivity.onCreate()
     */
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Medication Alerts",
                NotificationManager.IMPORTANCE_HIGH // Crucial for pop-ups
            ).apply {
                description = "Medication reminders and status alerts"
                enableLights(true)
                lightColor = Color.RED
                enableVibration(true)
                
                // Extremely noticeable vibration pattern
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)

                // Force TYPE_ALARM to bypass silent media streams
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                val audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()

                setSound(soundUri, audioAttributes)
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Shows the initial Medication Reminder that includes Taken/Missed actions.
     */
    fun showMedicationReminder(context: Context, medicationName: String) {
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)

        // 1. "Taken" Action Intent
        val takenIntent = Intent(context, MedicationActionReceiver::class.java).apply {
            action = MedicationActionReceiver.ACTION_TAKEN
            putExtra("MED_NAME", medicationName)
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context, 1, takenIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 2. "Missed" Action Intent
        val missedIntent = Intent(context, MedicationActionReceiver::class.java).apply {
            action = MedicationActionReceiver.ACTION_MISSED
            putExtra("MED_NAME", medicationName)
        }
        val missedPendingIntent = PendingIntent.getBroadcast(
            context, 2, missedIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Full-Screen Intent (Forces device wake-up)
        // Assuming there is a MainActivity in com.medtrack.ui package.
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Note: Replace android.R.drawable.ic_popup_reminder with your app's actual drawable
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder) 
            .setContentTitle("Time for $medicationName")
            .setContentText("Please take your medication now.")
            .setPriority(NotificationCompat.PRIORITY_HIGH) 
            
            // FORCE VISIBILITY (Very Important)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            
            // LOUD SOUND & VIBRATION CONFIGURATION
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 1000, 500, 1000))
            
            .setAutoCancel(true)
            .addAction(android.R.drawable.ic_menu_edit, "Taken ✅", takenPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Missed ❌", missedPendingIntent)

        with(NotificationManagerCompat.from(context)) {
            try {
                notify(NOTIFICATION_ID, builder.build())
            } catch (e: SecurityException) {
                // Ensure POST_NOTIFICATIONS runtime permission is accepted for Android 13+
                e.printStackTrace()
            }
        }
    }

    /**
     * Used by our BroadcastReceiver to show an updated notification with 
     * explicit sound/vibration regardless of the action taken (fix for Missed Bug).
     */
    fun showStatusUpdate(context: Context, statusTitle: String, message: String) {
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(statusTitle)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            
            // CATEGORY_ALARM ensures DND overrides if configured
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            
            // RE-APPLYING VIBRATION AND SOUND FOR UPDATES (FIXES "MISSED" SILENCE)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 1000, 500, 1000))
            .setAutoCancel(true)

        with(NotificationManagerCompat.from(context)) {
            try {
                // Overwrites the existing notification by using the SAME NOTIFICATION_ID
                notify(NOTIFICATION_ID, builder.build())
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        }
    }
}
