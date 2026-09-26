package com.elementspuyo.app

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.sin

/**
 * 오디오 파일 없는 실시간 톤 합성 SFX.
 * - 웹 audio.js 대응: playLand / playClear(rule) / playChain(chain)
 * - AudioTrack STATIC 모드로 즉시 재생. 실패해도 게임엔 영향 없음.
 */
object Sfx {
    private const val SAMPLE_RATE = 22050
    private val pool = Executors.newCachedThreadPool { r ->
        Thread(r, "sfx").apply { isDaemon = true }
    }
    private val enabled = AtomicBoolean(true)

    fun setEnabled(v: Boolean) { enabled.set(v) }
    fun isEnabled(): Boolean = enabled.get()
    fun toggle(): Boolean { val n = !enabled.get(); enabled.set(n); return n }

    /** 착지: 짧은 낮은 톤. */
    fun playLand() = fire { playTone(220.0, 70, 0.12f) }

    /**
     * 규칙별 소거 SFX.
     * metal: 굵고 낮게 · diatomic: 두 음 chirp · group: 밝은 3도 위 · period: 순수 A ·
     * molecule: 옥타브 위로.
     */
    fun playClear(rule: String) = fire {
        when (rule) {
            "metal" -> playTone(196.0, 240, 0.28f)        // G3, 낮고 길게
            "diatomic" -> { playTone(659.0, 90, 0.20f); Thread.sleep(60); playTone(988.0, 110, 0.22f) }
            "period" -> playTone(440.0, 160, 0.20f)       // A4
            "group" -> playTone(523.0, 160, 0.20f)        // C5
            else -> playTone(880.0, 200, 0.25f)           // molecule: A5
        }
    }

    /** 연쇄 카운트에 비례한 상승 톤 (반음씩). */
    fun playChain(chain: Int) = fire {
        val freq = 440.0 * 2.0.pow((chain - 1) / 12.0)
        playTone(freq, 140, 0.28f)
    }

    // ── 내부 ─────────────────────────────────────────────────────────
    private inline fun fire(crossinline action: () -> Unit) {
        if (!enabled.get()) return
        try { pool.execute { runCatching { action() } } } catch (_: Throwable) {}
    }

    /** freq Hz sine + exponential decay envelope. */
    private fun playTone(freqHz: Double, durationMs: Int, volume: Float) {
        val samples = SAMPLE_RATE * durationMs / 1000
        if (samples <= 0) return
        val buf = ShortArray(samples)
        val decay = 3.0 / (durationMs / 1000.0).coerceAtLeast(0.001)
        for (i in 0 until samples) {
            val t = i.toDouble() / SAMPLE_RATE
            val env = exp(-decay * t)
            val v = sin(2 * PI * freqHz * t) * env * volume
            buf[i] = (v * 32767.0).toInt().coerceIn(-32768, 32767).toShort()
        }
        val track: AudioTrack = try {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setSampleRate(SAMPLE_RATE)
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(buf.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()
        } catch (t: Throwable) {
            return
        }
        try {
            track.write(buf, 0, buf.size)
            track.play()
            Thread.sleep((durationMs + 40).toLong())
        } catch (_: Throwable) {
        } finally {
            runCatching { track.release() }
        }
    }
}
