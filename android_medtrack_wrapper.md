# MedTrack Android Wrapper Setup

This guide provides everything you need to wrap the MedTrack web application into a native Android app using a WebView. The implementation includes internet checking, a splash screen that waits for the page to load, smooth loading configurations, and basic setup for notification permissions.

## 1. Project Creation
1. Open **Android Studio**.
2. Click **New Project** > **Empty Activity** (Views, NOT Compose).
3. Name it **MedTrack**.
4. Language: **Kotlin**.
5. Minimum SDK: **API 24 (Android 7.0)** or higher.

---

## 2. AndroidManifest.xml Setup

Open `app/src/main/AndroidManifest.xml` and replace its content with the following. We added the necessary permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, and `POST_NOTIFICATIONS`) and configured the application.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="MedTrack"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MedTrack"
        android:usesCleartextTraffic="true"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

## 3. UI Layout (activity_main.xml)

Open `app/src/main/res/layout/activity_main.xml` and add the `WebView` along with a simple layout for the Splash screen and offline state.

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF">

    <!-- The WebApp Interface -->
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:visibility="gone" />

    <!-- Connection Error Layout -->
    <LinearLayout
        android:id="@+id/offlineLayout"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:gravity="center"
        android:orientation="vertical"
        android:visibility="gone">
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="No Internet Connection"
            android:textSize="18sp"
            android:textColor="#333333" />
        <Button
            android:id="@+id/retryButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:text="Retry" />
    </LinearLayout>

    <!-- Splash Screen Overlay -->
    <RelativeLayout
        android:id="@+id/splashLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#111827"> <!-- MedTrack dark theme background -->
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_centerInParent="true"
            android:text="MedTrack"
            android:textColor="#FFFFFF"
            android:textSize="32sp"
            android:textStyle="bold" />
            
        <ProgressBar
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentBottom="true"
            android:layout_centerHorizontal="true"
            android:layout_marginBottom="64dp"
            android:indeterminateTint="#10B981" /> <!-- Emerald green progress -->
    </RelativeLayout>

</RelativeLayout>
```

---

## 4. Main Kotlin Code (MainActivity.kt)

Open `app/src/main/java/com/yourname/medtrack/MainActivity.kt` and replace it with this single comprehensive file. 

> [!IMPORTANT]
> Change the `package com.yourname.medtrack` to match your actual package name created by Android Studio.
> Replace `MEDTRACK_URL` with your deployed application URL.

```kotlin
package com.yourname.medtrack

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.RelativeLayout
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var splashLayout: RelativeLayout
    private lateinit var offlineLayout: View
    private lateinit var retryButton: Button

    // TODO: Update this URL to point to your live MedTrack Next.js app
    private val MEDTRACK_URL = "https://your-medtrack-url.vercel.app/"

    // Register for notification permission (Android 13+)
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Handle basic notification permission state
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Hide action bar for full-screen feel
        supportActionBar?.hide()

        // Bind Views
        webView = findViewById(R.id.webView)
        splashLayout = findViewById(R.id.splashLayout)
        offlineLayout = findViewById(R.id.offlineLayout)
        retryButton = findViewById(R.id.retryButton)

        setupWebView()
        checkNotificationPermission()

        retryButton.setOnClickListener {
            loadApp()
        }

        loadApp()
    }

    private fun loadApp() {
        if (isNetworkAvailable()) {
            offlineLayout.visibility = View.GONE
            splashLayout.visibility = View.VISIBLE
            webView.loadUrl(MEDTRACK_URL)
        } else {
            splashLayout.visibility = View.GONE
            webView.visibility = View.GONE
            offlineLayout.visibility = View.VISIBLE
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Core WebSettings for Next.js compatibility
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        // WebChromeClient to handle JS alerts, progress, and web push basic permissions
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                // Auto-grant basic permissions for the web app (like notifications via web api)
                request.grant(request.resources)
            }
        }

        // WebViewClient to keep navigation inside the app and handle splash screen
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                // Show splash while starting to load (optional here since we set it in loadApp)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Smooth transition: Fade out splash screen natively
                splashLayout.animate()
                    .alpha(0f)
                    .setDuration(400)
                    .withEndAction {
                        splashLayout.visibility = View.GONE
                        webView.visibility = View.VISIBLE
                    }
            }
        }
    }

    // Handles the device physical back button to navigate WebView history
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // Checks if the device has an active internet connection
    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
    }

    // Request POST_NOTIFICATIONS permission for Android 13 (API 33) and above
    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
```

---

## 5. Build build.gradle.kts (App Level)

Verify your `app/build.gradle.kts` file has these configurations to ensure a fast and modernized app build.

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.yourname.medtrack"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yourname.medtrack"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    // Note: No extra dependencies required because we are using native WebView and default layouts.
}
```

---

## 6. How to Build the APK

To generate the Android `.apk` file so you can install it on actual devices:

### Option A: Using Android Studio UI (Recommended)
1. In the top menu, navigate to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
2. Wait for Gradle to finish assembling the app.
3. A small popup will appear in the bottom right corner saying "APK(s) generated successfully".
4. Click on **locate** in that popup to find your `.apk` file (typically in `app/build/outputs/apk/debug/app-debug.apk`).

### Option B: Using the Command Line (Gradle)
If your terminal is pointing to the Android project root directory, run:

```bash
# On Windows
gradlew assembleRelease

# On Mac/Linux
./gradlew assembleRelease
```
The APK will be output to `app/build/outputs/apk/release/app-release.apk`.
*(Note: To test directly, you can use `assembleDebug` instead).*

> [!TIP]
> To truly make the wrapper native, modify the `strings.xml` to update app names and download your own `ic_launcher` (App Icon) in Android Studio via `File -> New -> Image Asset`.
