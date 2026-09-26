package com.elementspuyo.app

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * 웹 뷰 얇은 쉘. `app/src/main/assets/` 아래 번들된 웹 앱을 로드 (오프라인 동작).
 * 웹 버전 UX 를 그대로 사용 — Compose 로 재구현하지 않음.
 */
class MainActivity : Activity() {
    private lateinit var web: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 몰입형 풀스크린 (상태·네비 바 숨김)
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )

        web = WebView(this).apply {
            setBackgroundColor(0xFF0D0D18.toInt())
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true            // localStorage (통계·진행상황)
                mediaPlaybackRequiresUserGesture = false   // WebAudio 자동 재생
                loadWithOverviewMode = true
                useWideViewPort = false
                textZoom = 100
            }
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            overScrollMode = WebView.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            loadUrl("file:///android_asset/index.html")
        }
        setContentView(web)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (this::web.isInitialized && web.canGoBack()) web.goBack()
        else @Suppress("DEPRECATION") super.onBackPressed()
    }

    override fun onPause() { super.onPause(); if (this::web.isInitialized) web.onPause() }
    override fun onResume() { super.onResume(); if (this::web.isInitialized) web.onResume() }
    override fun onDestroy() {
        if (this::web.isInitialized) {
            web.stopLoading(); web.destroy()
        }
        super.onDestroy()
    }
}
