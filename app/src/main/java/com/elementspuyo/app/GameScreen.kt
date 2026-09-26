package com.elementspuyo.app

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.elementspuyo.core.Element
import com.elementspuyo.core.Game
import com.elementspuyo.core.Matcher
import com.elementspuyo.core.Subset
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

// ─────────────────────────────────────────────────────────────────
// UI 스냅샷
// ─────────────────────────────────────────────────────────────────
private data class GameSnapshot(
    val field: List<List<Element?>>,
    val width: Int,
    val height: Int,
    val current: Element,
    val next: Element,
    val totalScore: Int,
    val isGameOver: Boolean,
)

private fun Game.snap() = GameSnapshot(
    field = field.snapshot(),
    width = field.width,
    height = field.height,
    current = current.element,
    next = next.element,
    totalScore = totalScore,
    isGameOver = isGameOver,
)

private data class Falling(val element: Element, val column: Int, val targetY: Int)
private data class PopupInfo(val nameKr: String, val formula: String, val cx: Float, val cy: Float, val isMolecule: Boolean)
private data class Particle(val originCx: Float, val originCy: Float, val angle: Float, val speed: Float, val color: Color)
private data class FloatingScore(val amount: Int, val cx: Float, val cy: Float, val big: Boolean)

private fun periodPalette(period: Int): Triple<Color, Color, Color> = when (period) {
    1 -> Triple(Color(0xFFFFE27A), Color(0xFFF7B937), Color(0xFFA4750A))
    2 -> Triple(Color(0xFF96E59F), Color(0xFF3FB653), Color(0xFF1E6B28))
    3 -> Triple(Color(0xFF7FC0FB), Color(0xFF2C8FEF), Color(0xFF145394))
    4 -> Triple(Color(0xFFDCB0FF), Color(0xFFB558FF), Color(0xFF6B21A8))
    else -> Triple(Color(0xFFC0C8D6), Color(0xFF8892A6), Color(0xFF63697A))
}

// ─────────────────────────────────────────────────────────────────
// Screen root
// ─────────────────────────────────────────────────────────────────
@Composable
fun GameScreen() {
    val context = LocalContext.current
    val stats = remember { Stats.from(context) }

    var game by remember { mutableStateOf(Game()) }
    var snap by remember { mutableStateOf(game.snap()) }
    var message by remember { mutableStateOf<String?>(null) }
    var falling by remember { mutableStateOf<Falling?>(null) }
    val fallY = remember { Animatable(0f) }
    var flashing by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var popup by remember { mutableStateOf<PopupInfo?>(null) }
    var particles by remember { mutableStateOf<List<Particle>>(emptyList()) }
    val particleT = remember { Animatable(0f) }
    var floatScore by remember { mutableStateOf<FloatingScore?>(null) }
    val floatT = remember { Animatable(0f) }
    val hexT = remember { Animatable(0f) }   // 6망성 회전
    var busy by remember { mutableStateOf(false) }
    var showRules by remember { mutableStateOf(false) }
    var soundOn by remember { mutableStateOf(Sfx.isEnabled()) }
    var pendingDrop by remember { mutableStateOf<Int?>(null) }
    var levelUpTo by remember { mutableStateOf<Int?>(null) }
    var gameEndRecorded by remember { mutableStateOf(false) }

    val currentLevel = Ranks.levelForScore(snap.totalScore)
    val progress = Ranks.progressToNext(snap.totalScore)
    val rank = Ranks.rankFor(currentLevel)

    fun tryDrop(col: Int) {
        if (busy || snap.isGameOver) return
        pendingDrop = col
    }

    LaunchedEffect(pendingDrop) {
        val col = pendingDrop ?: return@LaunchedEffect
        busy = true

        val landed = game.dropPiece(col)
        if (landed == null) {
            snap = game.snap()
            pendingDrop = null
            busy = false
            return@LaunchedEffect
        }

        // 낙하 애니메이션
        falling = Falling(snap.current, col, landed.y)
        val fromY = snap.height.toFloat()
        fallY.snapTo(fromY)
        val dist = fromY - landed.y
        val duration = (180 + dist / snap.height * 480).toInt().coerceIn(180, 700)
        fallY.animateTo(landed.y.toFloat(), tween(duration, easing = LinearOutSlowInEasing))
        falling = null
        snap = game.snap()
        Sfx.playLand()

        // 연쇄 루프
        val prevLevel = currentLevel
        var chainIdx = 0
        var totalDelta = 0
        val chainNames = mutableListOf<String>()
        while (true) {
            val res = Matcher(game.field).findAll()
            if (res.isEmpty) break
            chainIdx++

            val primary = when {
                res.metalCells.isNotEmpty() -> "metal"
                res.diatomicCells.isNotEmpty() -> "diatomic"
                res.groupCells.isNotEmpty() -> "group"
                res.periodCells.isNotEmpty() -> "period"
                else -> "molecule"
            }
            Sfx.playClear(primary)
            if (chainIdx >= 2) Sfx.playChain(chainIdx)

            flashing = res.allCleared
            val firstNamed = res.subsets.firstOrNull { it.nameKr.isNotEmpty() }
            if (firstNamed != null) {
                popup = popupOf(firstNamed, game.field.height)
                if (!firstNamed.isDiatomic) {
                    hexT.snapTo(0f)
                    launch { hexT.animateTo(1f, tween(800)) }
                }
            }
            for (s in res.subsets) if (s.nameKr.isNotEmpty() && s.nameKr !in chainNames) chainNames.add(s.nameKr)

            // 파티클
            val newParticles = mutableListOf<Particle>()
            for (cid in res.allCleared) {
                val gx = cid / snap.height
                val gy = cid % snap.height
                val e = snap.field[gy][gx] ?: continue
                val color = periodPalette(e.period).second
                repeat(6) {
                    newParticles.add(Particle(
                        originCx = gx + 0.5f,
                        originCy = gy + 0.5f,
                        angle = (it * 60 + (0..30).random()).toFloat(),
                        speed = (2..4).random().toFloat(),
                        color = color,
                    ))
                }
            }
            particles = newParticles
            particleT.snapTo(0f)

            coroutineScope {
                val pJob = launch { particleT.animateTo(1f, tween(600)) }
                delay(320)
                game.field.clearCids(res.allCleared)
                snap = game.snap()
                flashing = emptySet()
                delay(120)
                game.field.applyGravity()
                snap = game.snap()
                delay(180)
                pJob.join()
            }
            particles = emptyList()

            val delta = game.accrueStepScore(chainIdx - 1, res.allCleared.size, res.fired.size)
            totalDelta += delta
            snap = game.snap()
            stats.recordChain(chainIdx)
        }

        // 플로팅 점수 팝업
        if (chainIdx > 0 && totalDelta > 0) {
            val anchor = popup
            val cx = anchor?.cx ?: snap.width / 2f
            val cy = anchor?.cy ?: snap.height / 2f
            floatScore = FloatingScore(totalDelta, cx, cy, big = chainIdx >= 2)
            floatT.snapTo(0f)
            launch { floatT.animateTo(1f, tween(900)); floatScore = null }

            message = "${chainIdx}연쇄 · +$totalDelta · ${chainNames.take(3).joinToString(", ")}"
            stats.recordScore(snap.totalScore, currentLevel)

            delay(500)
        } else {
            message = null
        }
        popup = null

        // 랭크 상승 판정
        val newLevel = Ranks.levelForScore(snap.totalScore)
        if (newLevel > prevLevel) {
            levelUpTo = newLevel
            Sfx.playChain(6)  // 축하 소리
            delay(1600)
            levelUpTo = null
        }

        game.advancePiece()
        snap = game.snap()

        if (snap.isGameOver && !gameEndRecorded) {
            stats.recordGameEnd()
            gameEndRecorded = true
        }

        pendingDrop = null
        busy = false
    }

    fun reset() {
        game = Game()
        snap = game.snap()
        message = null
        falling = null
        flashing = emptySet()
        popup = null
        particles = emptyList()
        floatScore = null
        levelUpTo = null
        busy = false
        pendingDrop = null
        gameEndRecorded = false
    }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0D0D18))) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 8.dp)) {
            TopHud(
                score = snap.totalScore,
                current = snap.current,
                next = snap.next,
                soundOn = soundOn,
                onToggleSound = { soundOn = Sfx.toggle() },
                onHelp = { showRules = true },
            )
            Spacer(Modifier.height(6.dp))
            RankStripe(currentLevel = currentLevel, rank = rank, progress = progress, highScore = stats.highScore)
            Spacer(Modifier.height(8.dp))
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center,
            ) {
                FieldView(
                    snap = snap,
                    falling = falling,
                    fallingY = fallY.value,
                    flashing = flashing,
                    popup = popup,
                    hexProgress = hexT.value,
                    particles = particles,
                    particleT = particleT.value,
                    floatScore = floatScore,
                    floatT = floatT.value,
                    onColumnTap = ::tryDrop,
                )
            }
            MessageBar(message)
            if (snap.isGameOver) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("GAME OVER", color = Color(0xFFFF8080), fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("최종 점수 ${snap.totalScore}", color = Color.White, fontSize = 14.sp)
                    Text(
                        "최고 점수 ${stats.highScore} · 최고 연쇄 ${stats.highChain}단 · 플레이 ${stats.gamesPlayed}회",
                        color = Color(0xFF9AA5B8), fontSize = 11.sp,
                    )
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = { reset() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDCB0FF)),
                    ) { Text("다시 시작", color = Color(0xFF1A1A2E)) }
                }
            }
        }

        // 랭크업 오버레이
        AnimatedVisibility(visible = levelUpTo != null, enter = fadeIn(), exit = fadeOut()) {
            levelUpTo?.let { LevelUpOverlay(newLevel = it, rank = Ranks.rankFor(it)) }
        }

        // 규칙 오버레이
        AnimatedVisibility(visible = showRules, enter = fadeIn(), exit = fadeOut()) {
            RulesOverlay(onClose = { showRules = false })
        }
    }
}

private fun popupOf(sub: Subset, height: Int): PopupInfo {
    val cells = sub.cellIds.map { it / height to it % height }
    val avgX = cells.map { it.first }.average().toFloat()
    val avgY = cells.map { it.second }.average().toFloat()
    return PopupInfo(sub.nameKr, sub.formula, avgX, avgY, isMolecule = !sub.isDiatomic)
}

// ─────────────────────────────────────────────────────────────────
// TopHud + Rank
// ─────────────────────────────────────────────────────────────────
@Composable
private fun TopHud(
    score: Int,
    current: Element,
    next: Element,
    soundOn: Boolean,
    onToggleSound: () -> Unit,
    onHelp: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text("SCORE", color = Color(0xFF9AA5B8), fontSize = 10.sp)
            Text("$score", color = Color(0xFFFFCF3D), fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            LabeledMiniBall("NOW", current)
            Spacer(Modifier.width(12.dp))
            LabeledMiniBall("NEXT", next)
            Spacer(Modifier.width(12.dp))
            IconButtonRound(if (soundOn) "♪" else "♪", onClick = onToggleSound, dim = !soundOn)
            Spacer(Modifier.width(6.dp))
            IconButtonRound("?", onClick = onHelp)
        }
    }
}

@Composable
private fun RankStripe(currentLevel: Int, rank: AlchemistRank, progress: Float, highScore: Int) {
    Row(
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF1A1A2E)).padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ChemistPortrait(rankIndex = currentLevel - 1, size = 40.dp)
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text("RANK $currentLevel · ${rank.nameKr}", color = Color(0xFFFFCF3D), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(rank.era, color = Color(0xFF9AA5B8), fontSize = 9.sp)
            Spacer(Modifier.height(3.dp))
            // Progress bar
            Box(modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp))
                .background(Color(0x33FFFFFF))) {
                Box(modifier = Modifier.fillMaxWidth(progress).height(4.dp)
                    .clip(RoundedCornerShape(2.dp)).background(Color(0xFFDCB0FF)))
            }
        }
        Spacer(Modifier.width(10.dp))
        Column(horizontalAlignment = Alignment.End) {
            Text("HIGH", color = Color(0xFF9AA5B8), fontSize = 9.sp)
            Text("$highScore", color = Color(0xFFDCB0FF), fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun LabeledMiniBall(label: String, e: Element) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Color(0xFF9AA5B8), fontSize = 10.sp)
        Spacer(Modifier.height(2.dp))
        Canvas(modifier = Modifier.size(36.dp)) {
            val cx = size.width / 2; val cy = size.height / 2
            val r = size.width * 0.45f
            val (light, base, dark) = periodPalette(e.period)
            val brush = Brush.radialGradient(
                colors = listOf(light, base, dark),
                center = Offset(cx - r * 0.3f, cy - r * 0.35f),
                radius = r * 1.4f,
            )
            drawCircle(brush = brush, radius = r, center = Offset(cx, cy))
        }
        // label overlay via Box - unfortunately need Text on top. Simpler: use Box with Canvas + Text
    }
}

@Composable
private fun MessageBar(message: String?) {
    Text(
        text = message ?: " ",
        color = Color(0xFFDCB0FF),
        fontSize = 13.sp,
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun IconButtonRound(label: String, onClick: () -> Unit, dim: Boolean = false) {
    Box(
        modifier = Modifier.size(32.dp).clip(CircleShape)
            .background(if (dim) Color(0x11FFFFFF) else Color(0x33FFFFFF)).clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(label, color = if (dim) Color(0x66FFFFFF) else Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}

// ─────────────────────────────────────────────────────────────────
// FieldView — Canvas
// ─────────────────────────────────────────────────────────────────
@Composable
private fun FieldView(
    snap: GameSnapshot,
    falling: Falling?,
    fallingY: Float,
    flashing: Set<Int>,
    popup: PopupInfo?,
    hexProgress: Float,
    particles: List<Particle>,
    particleT: Float,
    floatScore: FloatingScore?,
    floatT: Float,
    onColumnTap: (Int) -> Unit,
) {
    val textMeasurer = rememberTextMeasurer()
    Canvas(
        modifier = Modifier.aspectRatio(snap.width.toFloat() / snap.height).clipToBounds()
            .pointerInput(snap.width) {
                detectTapGestures { offset ->
                    val col = (offset.x / size.width * snap.width).toInt().coerceIn(0, snap.width - 1)
                    onColumnTap(col)
                }
            },
    ) {
        val cell = kotlin.math.min(size.width / snap.width, size.height / snap.height)
        val fieldW = cell * snap.width
        val fieldH = cell * snap.height
        val offX = (size.width - fieldW) / 2
        val offY = (size.height - fieldH) / 2

        drawRect(Color(0xFF1A1A2E), Offset(offX, offY), Size(fieldW, fieldH))
        val gridColor = Color(0x1FFFFFFF)
        for (i in 0..snap.width) {
            val x = offX + i * cell
            drawLine(gridColor, Offset(x, offY), Offset(x, offY + fieldH), 1f)
        }
        for (j in 0..snap.height) {
            val y = offY + j * cell
            drawLine(gridColor, Offset(offX, y), Offset(offX + fieldW, y), 1f)
        }

        val radius = cell * 0.42f
        val fontPx = cell * 0.30f
        val fontSp = (fontPx / density).sp
        val labelStyle = TextStyle(fontSize = fontSp, color = Color(0xFF10121A), fontWeight = FontWeight.Bold)

        fun cellCenter(gx: Int, gy: Float): Offset =
            Offset(offX + gx * cell + cell / 2, offY + (snap.height - 1 - gy) * cell + cell / 2)

        fun drawBall(gx: Int, gyFloat: Float, e: Element, extraGlow: Boolean = false) {
            val c = cellCenter(gx, gyFloat)
            if (extraGlow) drawCircle(Color(0xAAFFEB3B), radius * 1.20f, c)
            val (light, base, dark) = periodPalette(e.period)
            val brush = Brush.radialGradient(
                colors = listOf(light, base, dark),
                center = Offset(c.x - radius * 0.3f, c.y - radius * 0.35f),
                radius = radius * 1.4f,
            )
            drawCircle(brush = brush, radius = radius, center = c)
            drawCircle(Color(0x44000000), radius, c, style = Stroke(width = 1.2f))
            val layout = textMeasurer.measure(e.label, labelStyle)
            drawText(layout, topLeft = Offset(c.x - layout.size.width / 2, c.y - layout.size.height / 2))
        }

        // 필드 볼
        for (y in snap.field.indices) for (x in snap.field[y].indices) {
            val e = snap.field[y][x] ?: continue
            val cid = x * snap.height + y
            drawBall(x, y.toFloat(), e, extraGlow = cid in flashing)
        }

        // 낙하 볼
        if (falling != null) {
            val hx = offX + falling.column * cell
            drawRect(Color(0x22DCB0FF), Offset(hx, offY), Size(cell, fieldH))
            drawBall(falling.column, fallingY, falling.element)
        }

        // 파티클
        if (particles.isNotEmpty() && particleT > 0f) {
            for (p in particles) {
                val originC = cellCenter(p.originCx.toInt(), snap.height - 1 - p.originCy)
                val rad = p.angle * kotlin.math.PI.toFloat() / 180f
                val d = p.speed * particleT * cell * 0.6f
                val px = originC.x + cos(rad) * d
                val py = originC.y - sin(rad) * d
                val alpha = (1f - particleT).coerceIn(0f, 1f)
                drawCircle(p.color.copy(alpha = alpha), cell * 0.08f, Offset(px, py))
            }
        }

        // 화합물 팝업 (분자 = 6망성 배경, 이원자/기타 = 원형 배경)
        if (popup != null) {
            val c = cellCenter(popup.cx.toInt(), snap.height - 1 - popup.cy)
            val py = c.y - cell * 1.8f
            val ringR = cell * 1.5f
            // 배경 링
            drawCircle(Color(0xB01A1A2E), ringR, Offset(c.x, py))
            drawCircle(Color(0xFFFFCF3D), ringR, Offset(c.x, py), style = Stroke(width = 1.2f))
            if (popup.isMolecule) {
                drawHexagram(Offset(c.x, py), ringR * 0.95f, Color(0xFFFFDC8C).copy(alpha = 0.85f), 1.5f, hexProgress)
            }
            // 텍스트
            val formStyle = TextStyle(
                fontSize = (cell * 0.42f / density).sp,
                color = Color(0xFFFFCF3D),
                fontWeight = FontWeight.Bold,
            )
            val nameStyle = TextStyle(
                fontSize = (cell * 0.26f / density).sp,
                color = Color.White,
            )
            val formLayout = textMeasurer.measure(popup.formula, formStyle)
            val nameLayout = textMeasurer.measure(popup.nameKr, nameStyle)
            drawText(formLayout, topLeft = Offset(c.x - formLayout.size.width / 2, py - formLayout.size.height / 2 - cell * 0.08f))
            drawText(nameLayout, topLeft = Offset(c.x - nameLayout.size.width / 2, py + cell * 0.20f))
        }

        // 플로팅 점수 (반응 위치에서 위로 fade)
        if (floatScore != null && floatT < 1f) {
            val c = cellCenter(floatScore.cx.toInt(), snap.height - 1 - floatScore.cy)
            val yOff = -cell * 1.5f * floatT
            val alpha = (1f - floatT).coerceIn(0f, 1f)
            val fs = if (floatScore.big) cell * 0.55f else cell * 0.42f
            val style = TextStyle(
                fontSize = (fs / density).sp,
                color = Color(0xFFFFDD66).copy(alpha = alpha),
                fontWeight = FontWeight.Black,
            )
            val txt = "+${floatScore.amount}"
            val layout = textMeasurer.measure(txt, style)
            drawText(layout, topLeft = Offset(c.x - layout.size.width / 2, c.y + yOff - layout.size.height / 2))
        }
    }
}

/** 6망성 (두 삼각형 겹침). progress 로 회전 애니. */
private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawHexagram(
    center: Offset,
    radius: Float,
    color: Color,
    strokeWidth: Float,
    progress: Float,
) {
    val cx = center.x
    val cy = center.y
    val rot = progress * 360f  // 한 바퀴 회전
    fun triangle(offset: Float): Path {
        val ang0 = (offset - 90f + rot) * kotlin.math.PI.toFloat() / 180f
        val ang1 = ang0 + 2 * kotlin.math.PI.toFloat() / 3f
        val ang2 = ang0 + 4 * kotlin.math.PI.toFloat() / 3f
        return Path().apply {
            moveTo(cx + cos(ang0) * radius, cy + sin(ang0) * radius)
            lineTo(cx + cos(ang1) * radius, cy + sin(ang1) * radius)
            lineTo(cx + cos(ang2) * radius, cy + sin(ang2) * radius)
            close()
        }
    }
    val alpha = (progress * 3f).coerceIn(0f, 1f) * color.alpha
    drawPath(triangle(0f), color.copy(alpha = alpha), style = Stroke(width = strokeWidth))
    drawPath(triangle(180f), color.copy(alpha = alpha), style = Stroke(width = strokeWidth))
}

// ─────────────────────────────────────────────────────────────────
// Overlays
// ─────────────────────────────────────────────────────────────────
@Composable
private fun LevelUpOverlay(newLevel: Int, rank: AlchemistRank) {
    Box(
        modifier = Modifier.fillMaxSize().background(Color(0xCC000000)),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("LEVEL UP!", color = Color(0xFFFFCF3D), fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            ChemistPortrait(rankIndex = newLevel - 1, size = 120.dp)
            Spacer(Modifier.height(10.dp))
            Text("RANK $newLevel", color = Color(0xFFDCB0FF), fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text(rank.nameKr, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text(rank.name, color = Color(0xFF9AA5B8), fontSize = 13.sp)
            Text(rank.era, color = Color(0xFF9AA5B8), fontSize = 11.sp)
        }
    }
}

@Composable
private fun RulesOverlay(onClose: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().background(Color(0xE0000000)).clickable { onClose() },
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF1A1A2E)).padding(20.dp),
        ) {
            Text("소거 규칙", color = Color(0xFFFFCF3D), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            RuleLine("1. 분자 (최우선)", "화이트리스트 화합물 완성 + 이원자(H₂, O₂ 등). 분자량 큰 것부터 소거.")
            RuleLine("2. 주기 가로", "같은 주기 5개 이상 서로 다른 원소가 가로로 연결.")
            RuleLine("3. 족 세로", "같은 족 3개 이상 서로 다른 원소가 세로로 연결.")
            RuleLine("4. 금속 결합", "같은 원소(이온 변종 통합) 금속 5개 이상 상하좌우 연결.")
            Spacer(Modifier.height(8.dp))
            Text(
                "규칙 2·3·4는 분자에 이미 쓰인 셀은 사용 못 하고, 서로는 셀 공유 가능.",
                color = Color(0xFF9AA5B8), fontSize = 11.sp,
            )
            Spacer(Modifier.height(16.dp))
            Text("탭 아무 데나 → 닫기", color = Color(0xFF9AA5B8), fontSize = 11.sp,
                modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.End)
        }
    }
}

@Composable
private fun RuleLine(title: String, body: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(title, color = Color(0xFFDCB0FF), fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(body, color = Color.White, fontSize = 12.sp)
    }
}
