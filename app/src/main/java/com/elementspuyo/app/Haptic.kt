package com.elementspuyo.app

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

/** 진동 헬퍼. 사운드 토글에 연동. */
object Haptic {
    private var vibrator: Vibrator? = null
    private var enabled = true

    fun init(context: Context) {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    fun setEnabled(v: Boolean) { enabled = v }

    fun tick() = pulse(60, 20)
    fun clear() = pulse(120, 40)
    fun chain(level: Int) = pulse(180 + level * 30, 60)
    fun levelUp() = pulse(255, 120)

    private fun pulse(amplitude: Int, ms: Long) {
        if (!enabled) return
        val v = vibrator ?: return
        if (!v.hasVibrator()) return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(ms, amplitude.coerceIn(1, 255)))
            } else {
                @Suppress("DEPRECATION")
                v.vibrate(ms)
            }
        } catch (_: Throwable) {}
    }
}
