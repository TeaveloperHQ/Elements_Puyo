plugins {
    id("com.android.application") version "8.7.3"
    kotlin("android") version "2.1.20"
}

android {
    namespace = "com.elementspuyo.app"
    compileSdk = 35

    // 웹 앱을 단일 소스로 유지 — assets 는 프로젝트 루트의 web/ 를 그대로 사용.
    // web/ 만 편집하면 됨. 별도 복사 단계 없음.
    sourceSets["main"].assets.srcDirs("../web")

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
