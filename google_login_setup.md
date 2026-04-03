# Manual Steps to Enable Google Login for MedTrack

Your codebase is already prepared to handle Google Login (including the button and the callback handler). To make it work, you just need to configure the connection between Google Cloud and your Supabase project.

Follow these steps exactly:

## 1. Google Cloud Console Configuration

1.  **Visit Console**: Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create Project**: Click the project dropdown and select **New Project**. Name it `MedTrack` and click **Create**.
3.  **OAuth Consent Screen**:
    *   Search for "OAuth consent screen" in the top search bar and click it.
    *   Select **External** and Click **Create**.
    *   **App Information**: Fill in:
        *   App name: `MedTrack`
        *   User support email: (your email)
        *   Developer contact info: (your email)
    *   Click **Save and Continue**.
    *   **Scopes**: Click **Add or Remove Scopes**.
    *   Add: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
    *   Click **Update** then **Save and Continue**.
    *   Add your own email as a **Test User** since the app is in testing mode.
4.  **Create Credentials**:
    *   Navigate to **Credentials** in the left sidebar.
    *   Click **+ Create Credentials** > **OAuth client ID**.
    *   **Application type**: Select **Web application**.
    *   **Name**: `MedTrack Web Client`.
    *   **Authorized JavaScript origins**:
        *   `http://localhost:3000`
    *   **Authorized redirect URIs**:
        *   `https://aaausewzrvzyizkeuutb.supabase.co/auth/v1/callback`
        *   `http://localhost:3000/auth/v1/callback` (for local development)
    *   Click **Create**.
5.  **Copy Secrets**: A popup will show your **Client ID** and **Client Secret**. Copy these values.

## 2. Supabase Dashboard Configuration

1.  **Go to Supabase**: Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/aaausewzrvzyizkeuutb).
2.  **Auth Settings**: Navigate to **Authentication** > **Providers** (under the "Configuration" section).
3.  **Enable Google**:
    *   Find **Google** in the list and click it.
    *   Toggle **Enable Google**.
    *   **Client ID**: Paste the Client ID from Google Cloud Console.
    *   **Client Secret**: Paste the Client Secret from Google Cloud Console.
4.  **Save**: Click **Save** at the bottom of the provider settings.

## 3. Verify Code Implementation (Already Done)

I have verified that your code is already set up to handle this:
*   **Login Button**: Found in [login/page.tsx](file:///c:/Medtrack_DT/src/app/login/page.tsx) with the `handleGoogleLogin` function.
*   **Auth Callback**: Found in [auth/callback/route.ts](file:///c:/Medtrack_DT/src/app/auth/callback/route.ts) to handle the secure code exchange.

## 4. Test it!
1.  Run your app: `npm run dev`
2.  Go to `http://localhost:3000/login`
3.  Click **Continue with Google**.
4.  It should now redirect you to Google's sign-in screen and then back to your dashboard!

> [!TIP]
> Ensure the **Authorized redirect URIs** in Google Cloud Console exactly match the values above. Any extra slash or missing character will cause an "Error 400: redirect_uri_mismatch".
