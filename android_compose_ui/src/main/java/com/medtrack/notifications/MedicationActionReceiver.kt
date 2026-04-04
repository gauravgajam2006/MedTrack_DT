package com.medtrack.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Captures actions directly from the Notification drawer.
 * Must be registered in AndroidManifest.xml unless kept strictly dynamic.
 */
class MedicationActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_TAKEN = "com.medtrack.notifications.ACTION_TAKEN"
        const val ACTION_MISSED = "com.medtrack.notifications.ACTION_MISSED"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val medName = intent.getStringExtra("MED_NAME") ?: "Medication"

        when (intent.action) {
            ACTION_TAKEN -> {
                Log.d("MedTrackReceiver", "Medication Taken: $medName")
                
                // Show identical notification wrapper, playing the sound + vibration automatically
                MedTrackNotificationManager.showStatusUpdate(
                    context = context,
                    statusTitle = "Dose Taken ✅",
                    message = "Confirmed taken: $medName. Great job!"
                )
                
                // TODO: Update Room Database / API to mark dose as taken here
            }
            ACTION_MISSED -> {
                Log.d("MedTrackReceiver", "Medication Missed: $medName")
                
                // Show identical notification wrapper, playing the sound + vibration automatically
                // THIS FIXES THE SILENT MISSED BUG
                MedTrackNotificationManager.showStatusUpdate(
                    context = context,
                    statusTitle = "Dose Missed ❌",
                    message = "You marked $medName as missed."
                )
                
                // TODO: Update Room Database / API to mark dose as missed here
            }
        }
    }
}
