plugins {
    id("com.android.application") version "8.7.3"
    kotlin("android") version "2.1.20"
}

android {
    namespace = "com.elementspuyo.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.elementspuyo.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    jvmToolchain(17)
}

// WebView 는 Android core 에 포함 — 별도 의존성 없음.
dependencies {}
