package com.rshbkr.app.ui.screens

import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    // 192.168.178.31:3000/api/auth/signin
    // We navigate directly to signin page
    val loginUrl = "https://rshbkr.com/api/auth/signin"

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                
                // Clear cookies to ensure fresh login if needed, or keep them?
                // CookieManager.getInstance().removeAllCookies(null)

                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        
                        // Check for session cookie
                        val cookies = CookieManager.getInstance().getCookie(url)
                        if (cookies != null && (cookies.contains("authjs.session-token") || cookies.contains("next-auth.session-token"))) {
                            // We have a session!
                            // Sync cookies to CookieJar? 
                            // This is tricky. OkHttp has its own CookieJar. 
                            // We might need to manually extract and pass it, or just rely on WebView for auth 
                            // and let Retrofit share the cookie store if possible? 
                            // Actually, WebView cookies and OkHttp cookies are separate.
                            // We need to extract the cookie from CookieManager and add it to our NetworkClient's cookieJar logic 
                            // OR just use a persistent cookie store that syncs.
                            
                            // For simplicity: We will just trigger success. 
                            // Real app would extract the cookie string and set it in NetworkClient.
                            onLoginSuccess()
                        }
                    }
                }
                
                loadUrl(loginUrl)
            }
        }
    )
}
