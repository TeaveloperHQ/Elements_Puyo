package com.elementspuyo.app

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

/**
 * 12 연금술사 엠블럼. 웹 portraits.js SVG 를 Compose Canvas 로 재현 (간략화).
 * 세피아·황금 팔레트. 각 엠블럼은 랭크 index (0..11) 로 지정.
 */

private val GOLD = Color(0xFFFFD88A)
private val AMBER = Color(0xFFFFB45A)
private val COPPER = Color(0xFFC48533)
private val BRONZE = Color(0xFF8A5A25)
private val DARK = Color(0xFF3A2A15)
private val BG_DARK = Color(0xFF1E1408)
private val BG_MID = Color(0xFF5A3F1E)

@Composable
fun ChemistPortrait(rankIndex: Int, size: Dp = 40.dp) {
    val bgBrush = Brush.radialGradient(
        colors = listOf(BG_MID, BG_DARK),
    )
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(bgBrush),
        contentAlignment = Alignment.Center,
    ) {
        val textMeasurer = rememberTextMeasurer()
        Canvas(modifier = Modifier.size(size)) {
            drawEmblem(rankIndex.coerceIn(0, 11), textMeasurer)
        }
    }
}

private fun DrawScope.drawEmblem(idx: Int, tm: androidx.compose.ui.text.TextMeasurer) {
    val u = size.width / 100f   // 100x100 viewBox unit
    when (idx) {
        0  -> drawZosimos(u)
        1  -> drawJabir(u, tm)
        2  -> drawParacelsus(u, tm)
        3  -> drawBoyle(u, tm)
        4  -> drawLavoisier(u)
        5  -> drawDalton(u, tm)
        6  -> drawAvogadro(u, tm)
        7  -> drawMendeleev(u)
        8  -> drawCurie(u)
        9  -> drawRutherford(u)
        10 -> drawBohr(u)
        11 -> drawPauling(u)
    }
}

// ── 0. Zosimos — 증류기 alembic ────────────────────────────────────────
private fun DrawScope.drawZosimos(u: Float) {
    // base
    drawRect(BRONZE, Offset(35 * u, 70 * u), Size(30 * u, 8 * u))
    drawRect(GOLD, Offset(35 * u, 70 * u), Size(30 * u, 8 * u), style = Stroke(1.2f))
    // ellipse body
    drawOval(
        color = Color(0xFFFFD88A).copy(alpha = 0.9f),
        topLeft = Offset(32 * u, 48 * u),
        size = Size(36 * u, 24 * u),
    )
    drawOval(GOLD, Offset(32 * u, 48 * u), Size(36 * u, 24 * u), style = Stroke(1.5f))
    // neck (bent) — approximated with quad path
    val neck = Path().apply {
        moveTo(50 * u, 48 * u)
        quadraticBezierTo(50 * u, 30 * u, 62 * u, 22 * u)
        quadraticBezierTo(70 * u, 18 * u, 74 * u, 22 * u)
    }
    drawPath(neck, GOLD, style = Stroke(width = 2.2f))
    drawCircle(GOLD, 3 * u, Offset(76 * u, 24 * u))
}

// ── 1. Jabir — 플라스크 + 별 ────────────────────────────────────────────
private fun DrawScope.drawJabir(u: Float, tm: androidx.compose.ui.text.TextMeasurer) {
    val body = Path().apply {
        moveTo(40 * u, 30 * u); lineTo(40 * u, 48 * u)
        lineTo(26 * u, 74 * u); quadraticBezierTo(24 * u, 82 * u, 32 * u, 82 * u)
        lineTo(68 * u, 82 * u); quadraticBezierTo(76 * u, 82 * u, 74 * u, 74 * u)
        lineTo(60 * u, 48 * u); lineTo(60 * u, 30 * u); close()
    }
    drawPath(body, COPPER)
    drawPath(body, GOLD, style = Stroke(1.5f))
    // cap
    drawRect(BRONZE, Offset(40 * u, 24 * u), Size(20 * u, 8 * u))
    drawRect(GOLD, Offset(40 * u, 24 * u), Size(20 * u, 8 * u), style = Stroke(1.2f))
    // star (5-pointed)
    drawStar(Offset(50 * u, 50 * u), 8 * u, GOLD, 5, sharpness = 0.4f)
}

// ── 2. Paracelsus — 뱀 + 지팡이 + ☿ 텍스트 ─────────────────────────────
private fun DrawScope.drawParacelsus(u: Float, tm: androidx.compose.ui.text.TextMeasurer) {
    // staff
    drawLine(GOLD, Offset(50 * u, 16 * u), Offset(50 * u, 82 * u), 2.5f)
    // serpent — S-curve
    val snake = Path().apply {
        moveTo(50 * u, 30 * u)
        quadraticBezierTo(36 * u, 34 * u, 36 * u, 44 * u)
        quadraticBezierTo(36 * u, 54 * u, 50 * u, 54 * u)
        quadraticBezierTo(64 * u, 54 * u, 64 * u, 64 * u)
        quadraticBezierTo(64 * u, 74 * u, 50 * u, 76 * u)
    }
    drawPath(snake, COPPER, style = Stroke(width = 3.2f))
    drawCircle(GOLD, 3.5f * u, Offset(36 * u, 30 * u))   // snake head
    // mercury symbol
    val layout = tm.measure("☿", TextStyle(fontSize = (11 * u / density).sp, color = GOLD, fontWeight = FontWeight.Black))
    drawText(layout, topLeft = Offset(50 * u - layout.size.width / 2f, 84 * u))
}

// ── 3. Boyle — 실린더 + 화살표 + P ─────────────────────────────────────
private fun DrawScope.drawBoyle(u: Float, tm: androidx.compose.ui.text.TextMeasurer) {
    drawRect(DARK, Offset(34 * u, 20 * u), Size(32 * u, 60 * u))
    drawRect(GOLD, Offset(34 * u, 20 * u), Size(32 * u, 60 * u), style = Stroke(1.5f))
    // gas
    drawRect(GOLD.copy(alpha = 0.25f), Offset(36 * u, 46 * u), Size(28 * u, 32 * u))
    drawLine(GOLD, Offset(36 * u, 46 * u), Offset(64 * u, 46 * u), 1.2f,
        pathEffect = PathEffect.dashPathEffect(floatArrayOf(2f, 2f)))
    // molecules
    for ((x, y) in listOf(42 to 60, 52 to 68, 58 to 56, 46 to 72)) {
        drawCircle(GOLD, 2 * u, Offset(x * u, y * u))
    }
    // pressure arrow
    drawLine(AMBER, Offset(78 * u, 30 * u), Offset(78 * u, 50 * u), 2f)
    drawLine(AMBER, Offset(74 * u, 46 * u), Offset(78 * u, 50 * u), 2f)
    drawLine(AMBER, Offset(78 * u, 50 * u), Offset(82 * u, 46 * u), 2f)
    val pLayout = tm.measure("P", TextStyle(fontSize = (8 * u / density).sp, color = AMBER))
    drawText(pLayout, topLeft = Offset(80 * u - pLayout.size.width / 2f, 20 * u))
}

// ── 4. Lavoisier — 저울 ────────────────────────────────────────────────
private fun DrawScope.drawLavoisier(u: Float) {
    drawLine(GOLD, Offset(50 * u, 20 * u), Offset(50 * u, 70 * u), 2.5f)
    drawLine(GOLD, Offset(20 * u, 35 * u), Offset(80 * u, 35 * u), 2.5f)
    // left pan
    val leftPan = Path().apply {
        moveTo(14 * u, 35 * u); lineTo(20 * u, 53 * u); lineTo(8 * u, 53 * u); close()
    }
    val rightPan = Path().apply {
        moveTo(86 * u, 35 * u); lineTo(92 * u, 53 * u); lineTo(80 * u, 53 * u); close()
    }
    drawPath(leftPan, COPPER); drawPath(leftPan, GOLD, style = Stroke(1.2f))
    drawPath(rightPan, COPPER); drawPath(rightPan, GOLD, style = Stroke(1.2f))
    // base
    drawRect(BRONZE, Offset(38 * u, 70 * u), Size(24 * u, 10 * u))
    drawRect(GOLD, Offset(38 * u, 70 * u), Size(24 * u, 10 * u), style = Stroke(1.2f))
    drawCircle(GOLD, 3 * u, Offset(50 * u, 20 * u))
}

// ── 5. Dalton — 원자 O + H + H (물) ────────────────────────────────────
private fun DrawScope.drawDalton(u: Float, tm: androidx.compose.ui.text.TextMeasurer) {
    drawCircle(COPPER, 18 * u, Offset(50 * u, 42 * u))
    drawCircle(GOLD, 18 * u, Offset(50 * u, 42 * u), style = Stroke(1.8f))
    val oLayout = tm.measure("O", TextStyle(fontSize = (18 * u / density).sp, color = GOLD, fontWeight = FontWeight.Black))
    drawText(oLayout, topLeft = Offset(50 * u - oLayout.size.width / 2f, 42 * u - oLayout.size.height / 2f))
    drawCircle(BRONZE, 10 * u, Offset(28 * u, 68 * u))
    drawCircle(GOLD, 10 * u, Offset(28 * u, 68 * u), style = Stroke(1.5f))
    drawCircle(BRONZE, 10 * u, Offset(72 * u, 68 * u))
    drawCircle(GOLD, 10 * u, Offset(72 * u, 68 * u), style = Stroke(1.5f))
    val hL = tm.measure("H", TextStyle(fontSize = (10 * u / density).sp, color = GOLD, fontWeight = FontWeight.Black))
    drawText(hL, topLeft = Offset(28 * u - hL.size.width / 2f, 68 * u - hL.size.height / 2f))
    drawText(hL, topLeft = Offset(72 * u - hL.size.width / 2f, 68 * u - hL.size.height / 2f))
    drawLine(GOLD, Offset(40 * u, 52 * u), Offset(34 * u, 60 * u), 1.5f)
    drawLine(GOLD, Offset(60 * u, 52 * u), Offset(66 * u, 60 * u), 1.5f)
}

// ── 6. Avogadro — 상자 안 입자들 ──────────────────────────────────────
private fun DrawScope.drawAvogadro(u: Float, tm: androidx.compose.ui.text.TextMeasurer) {
    drawRect(Color.Transparent, Offset(18 * u, 28 * u), Size(64 * u, 52 * u))
    drawRect(GOLD, Offset(18 * u, 28 * u), Size(64 * u, 52 * u), style = Stroke(1.8f))
    val dots = listOf(
        Triple(30, 42, GOLD), Triple(46, 56, COPPER), Triple(66, 44, GOLD),
        Triple(38, 70, COPPER), Triple(60, 66, GOLD), Triple(72, 72, COPPER),
    )
    for ((x, y, c) in dots) drawCircle(c, 4 * u, Offset(x * u, y * u))
    val hdr = tm.measure("V,T,P", TextStyle(fontSize = (7 * u / density).sp, color = AMBER, fontWeight = FontWeight.Bold))
    drawText(hdr, topLeft = Offset(50 * u - hdr.size.width / 2f, 20 * u))
}

// ── 7. Mendeleev — 미니 주기율표 ──────────────────────────────────────
private fun DrawScope.drawMendeleev(u: Float) {
    val cells = listOf(
        14 to 24,
        14 to 36, 26 to 36,
        14 to 48, 26 to 48, 52 to 48, 64 to 48, 76 to 48,
        14 to 60, 26 to 60, 52 to 60, 64 to 60, 76 to 60,
    )
    for ((x, y) in cells) {
        drawRect(DARK, Offset(x * u, y * u), Size(10 * u, 10 * u))
        drawRect(GOLD, Offset(x * u, y * u), Size(10 * u, 10 * u), style = Stroke(1f))
    }
    // highlight some
    drawRect(GOLD.copy(alpha = 0.6f), Offset(14 * u, 24 * u), Size(10 * u, 10 * u))
    drawRect(GOLD.copy(alpha = 0.4f), Offset(76 * u, 48 * u), Size(10 * u, 10 * u))
    drawRect(GOLD.copy(alpha = 0.4f), Offset(76 * u, 60 * u), Size(10 * u, 10 * u))
}

// ── 8. Curie — 방사능 3-fold ─────────────────────────────────────────
private fun DrawScope.drawCurie(u: Float) {
    drawCircle(GOLD, 6 * u, Offset(50 * u, 50 * u))
    for (rot in listOf(0, 120, 240)) {
        val cx = 50 * u; val cy = 50 * u
        val rad = rot * kotlin.math.PI.toFloat() / 180f
        val ang1 = rad - 0.5f; val ang2 = rad + 0.5f
        val p = Path().apply {
            moveTo(cx, cy)
            lineTo(cx + cos(ang1) * 38 * u, cy + sin(ang1) * 38 * u)
            arcTo(
                rect = androidx.compose.ui.geometry.Rect(cx - 38 * u, cy - 38 * u, cx + 38 * u, cy + 38 * u),
                startAngleDegrees = Math.toDegrees(ang1.toDouble()).toFloat(),
                sweepAngleDegrees = Math.toDegrees((ang2 - ang1).toDouble()).toFloat(),
                forceMoveTo = false,
            )
            close()
        }
        drawPath(p, COPPER); drawPath(p, GOLD, style = Stroke(1f))
    }
    drawCircle(GOLD.copy(alpha = 0.4f), 30 * u, Offset(50 * u, 50 * u), style = Stroke(0.8f))
}

// ── 9. Rutherford — 알파 산란 ──────────────────────────────────────
private fun DrawScope.drawRutherford(u: Float) {
    val dash = PathEffect.dashPathEffect(floatArrayOf(2f, 2f))
    drawLine(GOLD, Offset(10 * u, 30 * u), Offset(46 * u, 46 * u), 1.4f, pathEffect = dash)
    val curve1 = Path().apply { moveTo(46 * u, 46 * u); quadraticBezierTo(55 * u, 42 * u, 90 * u, 20 * u) }
    drawPath(curve1, AMBER, style = Stroke(1.8f))
    drawLine(GOLD.copy(alpha = 0.5f), Offset(10 * u, 60 * u), Offset(90 * u, 60 * u), 1f, pathEffect = dash)
    drawLine(GOLD, Offset(10 * u, 80 * u), Offset(42 * u, 60 * u), 1.2f, pathEffect = dash)
    val curve2 = Path().apply { moveTo(42 * u, 60 * u); quadraticBezierTo(54 * u, 66 * u, 90 * u, 82 * u) }
    drawPath(curve2, AMBER, style = Stroke(1.8f))
    drawCircle(GOLD, 7 * u, Offset(50 * u, 52 * u))
    drawCircle(AMBER, 7 * u, Offset(50 * u, 52 * u), style = Stroke(1.5f))
}

// ── 10. Bohr — 원자 궤도 ──────────────────────────────────────────
private fun DrawScope.drawBohr(u: Float) {
    drawCircle(GOLD, 6 * u, Offset(50 * u, 50 * u))
    // three ellipses at 0/60/-60 degrees
    for ((angle, color) in listOf(0f to GOLD, 60f to AMBER, -60f to COPPER)) {
        rotate(angle, Offset(50 * u, 50 * u)) {
            drawOval(color, Offset(16 * u, 36 * u), Size(68 * u, 28 * u), style = Stroke(1.4f))
        }
    }
    drawCircle(GOLD, 3 * u, Offset(84 * u, 50 * u))
    drawCircle(AMBER, 3 * u, Offset(34 * u, 20 * u))
    drawCircle(COPPER, 3 * u, Offset(34 * u, 80 * u))
}

// ── 11. Pauling — 나선 ─────────────────────────────────────────────
private fun DrawScope.drawPauling(u: Float) {
    val helix1 = Path().apply {
        moveTo(32 * u, 18 * u)
        quadraticBezierTo(68 * u, 30 * u, 32 * u, 42 * u)
        quadraticBezierTo(68 * u, 54 * u, 32 * u, 66 * u)
        quadraticBezierTo(68 * u, 78 * u, 32 * u, 90 * u)
    }
    val helix2 = Path().apply {
        moveTo(68 * u, 18 * u)
        quadraticBezierTo(32 * u, 30 * u, 68 * u, 42 * u)
        quadraticBezierTo(32 * u, 54 * u, 68 * u, 66 * u)
        quadraticBezierTo(32 * u, 78 * u, 68 * u, 90 * u)
    }
    drawPath(helix1, GOLD, style = Stroke(2f))
    drawPath(helix2, GOLD, style = Stroke(2f))
    for (y in listOf(24, 48, 72)) {
        drawLine(AMBER, Offset(34 * u, y * u), Offset(66 * u, y * u), 1.4f)
        drawCircle(GOLD, 2.5f * u, Offset(34 * u, y * u))
        drawCircle(GOLD, 2.5f * u, Offset(66 * u, y * u))
    }
}

// ── 유틸 ─────────────────────────────────────────────────────────
private fun DrawScope.drawStar(center: Offset, radius: Float, color: Color, points: Int, sharpness: Float) {
    val innerR = radius * sharpness
    val path = Path()
    for (i in 0 until points * 2) {
        val r = if (i % 2 == 0) radius else innerR
        val ang = (i * kotlin.math.PI / points) - kotlin.math.PI / 2
        val x = center.x + cos(ang).toFloat() * r
        val y = center.y + sin(ang).toFloat() * r
        if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
    }
    path.close()
    drawPath(path, color)
}

