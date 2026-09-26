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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
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

/** UI 스냅샷. Compose 는 클래스 내부 mutation 을 감지 못 하므로 명시적 State 로 감싼다. */
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

/** 화합물 이름 팝업 위치는 격자 좌표 평균. */
private data class PopupInfo(
    val nameKr: String,
    val formula: String,
    val cx: Float,   // 격자 x 평균
    val cy: Float,   // 격자 y 평균 (0=바닥)
)

/** 파티클 하나 — 방출 각도/속도 encode, t=0..1 로 위치·투명도 계산. */
private data class Particle(val originCx: Float, val originCy: Float, val angle: Float, val speed: Float, val color: Color)

@Composable
fun GameScreen() {
    var game by remember { mutableStateOf(Game()) }
    var snap by remember { mutableStateOf(game.snap()) }
    var message by remember { mutableStateOf<String?>(null) }
    var falling by remember { mutableStateOf<Falling?>(null) }
    val fallY = remember { Animatable(0f) }
    var flashing by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var popup by remember { mutableStateOf<PopupInfo?>(null) }
    var particles by remember { mutableStateOf<List<Particle>>(emptyList()) }
    val particleT = remember { Animatable(0f) }
    var busy by remember { mutableStateOf(false) }
    var showRules by remember { mutableStateOf(false) }
    var pendingDrop by remember { mutableStateOf<Int?>(null) }

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

        // 1) 낙하 애니메이션
        falling = Falling(snap.current, col, landed.y)
        val fromY = snap.height.toFloat()
        fallY.snapTo(fromY)
        val dist = fromY - landed.y
        val duration = (180 + dist / snap.height * 480).toInt().coerceIn(180, 700)
        fallY.animateTo(landed.y.toFloat(), tween(duration, easing = LinearOutSlowInEasing))
        falling = null
        snap = game.snap()

        // 2) 연쇄 루프 — 각 단계에서 highlight → clear → gravity 순
        var chainIdx = 0
        var totalDelta = 0
        val chainNames = mutableListOf<String>()
        while (true) {
            val res = Matcher(game.field).findAll()
            if (res.isEmpty) break
            chainIdx++

            // Highlight 단계 (셀 flash + 팝업 + 파티클 준비)
            flashing = res.allCleared
            val firstNamed = res.subsets.firstOrNull { it.nameKr.isNotEmpty() }
            if (firstNamed != null) {
                popup = popupOf(firstNamed, game.field.height)
            }
            for (s in res.subsets) if (s.nameKr.isNotEmpty() && s.nameKr !in chainNames) chainNames.add(s.nameKr)

            // 파티클 생성 (각 소거 셀마다 5개)
            val newParticles = mutableListOf<Particle>()
            for (cid in res.allCleared) {
                val gx = cid / snap.height
                val gy = cid % snap.height
                val e = snap.field[gy][gx] ?: continue
                val color = Color(e.periodColor)
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

            // 파티클 애니 + clear + gravity 를 병렬로 (structured concurrency)
            coroutineScope {
                val pJob = launch { particleT.animateTo(1f, tween(600)) }
                delay(320)   // flash 유지
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

            // 점수 누적
            totalDelta += game.accrueStepScore(chainIdx - 1, res.allCleared.size, res.fired.size)
            snap = game.snap()
        }

        if (chainIdx > 0) {
            message = "${chainIdx}연쇄 · +$totalDelta · ${chainNames.take(3).joinToString(", ")}"
            delay(500)
        } else {
            message = null
        }
        popup = null

        // 6) 다음 조각
        game.advancePiece()
        snap = game.snap()

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
        busy = false
        pendingDrop = null
    }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0D0D18))) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 8.dp)) {
            TopHud(
                score = snap.totalScore,
                current = snap.current,
                next = snap.next,
                onHelp = { showRules = true },
            )
            Spacer(Modifier.height(10.dp))
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
                    particles = particles,
                    particleT = particleT.value,
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
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = { reset() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDCB0FF)),
                    ) { Text("다시 시작", color = Color(0xFF1A1A2E)) }
                }
            }
        }

        AnimatedVisibility(
            visible = showRules,
            enter = fadeIn(),
            exit = fadeOut(),
        ) {
            RulesOverlay(onClose = { showRules = false })
        }
    }
}

private fun popupOf(sub: Subset, height: Int): PopupInfo {
    val cells = sub.cellIds.map { it / height to it % height }
    val avgX = cells.map { it.first }.average().toFloat()
    val avgY = cells.map { it.second }.average().toFloat()
    return PopupInfo(sub.nameKr, sub.formula, avgX, avgY)
}

@Composable
private fun TopHud(score: Int, current: Element, next: Element, onHelp: () -> Unit) {
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
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(Color(0x33FFFFFF))
                    .clickable { onHelp() },
                contentAlignment = Alignment.Center,
            ) {
                Text("?", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun LabeledMiniBall(label: String, e: Element) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Color(0xFF9AA5B8), fontSize = 10.sp)
        Spacer(Modifier.height(2.dp))
        Box(
            modifier = Modifier.size(36.dp).clip(CircleShape).background(Color(e.periodColor)),
            contentAlignment = Alignment.Center,
        ) {
            Text(e.label, color = Color(0xFF1A1A2E), fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
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
private fun FieldView(
    snap: GameSnapshot,
    falling: Falling?,
    fallingY: Float,
    flashing: Set<Int>,
    popup: PopupInfo?,
    particles: List<Particle>,
    particleT: Float,
    onColumnTap: (Int) -> Unit,
) {
    val textMeasurer = rememberTextMeasurer()
    Canvas(
        modifier = Modifier
            .aspectRatio(snap.width.toFloat() / snap.height)
            .clipToBounds()
            .pointerInput(snap.width) {
                detectTapGestures { offset ->
                    val col = (offset.x / size.width * snap.width).toInt()
                        .coerceIn(0, snap.width - 1)
                    onColumnTap(col)
                }
            },
    ) {
        val cell = kotlin.math.min(size.width / snap.width, size.height / snap.height)
        val fieldW = cell * snap.width
        val fieldH = cell * snap.height
        val offX = (size.width - fieldW) / 2
        val offY = (size.height - fieldH) / 2

        // 배경
        drawRect(Color(0xFF1A1A2E), Offset(offX, offY), Size(fieldW, fieldH))
        // 격자
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
            if (extraGlow) {
                drawCircle(Color(0xAAFFEB3B), radius * 1.15f, c)
            }
            drawCircle(Color(e.periodColor), radius, c)
            drawCircle(Color(0x33000000), radius, c, style = Stroke(width = 1f))
            val layout = textMeasurer.measure(e.label, labelStyle)
            drawText(layout, topLeft = Offset(c.x - layout.size.width / 2, c.y - layout.size.height / 2))
        }

        // 필드 볼 (flash 셀은 노란 글로우 추가)
        for (y in snap.field.indices) {
            for (x in snap.field[y].indices) {
                val e = snap.field[y][x] ?: continue
                val cid = x * snap.height + y
                drawBall(x, y.toFloat(), e, extraGlow = cid in flashing)
            }
        }

        // 낙하 볼 + 대상 열 하이라이트
        if (falling != null) {
            val hx = offX + falling.column * cell
            drawRect(Color(0x22DCB0FF), Offset(hx, offY), Size(cell, fieldH))
            drawBall(falling.column, fallingY, falling.element)
        }

        // 파티클 (반경 밖으로 방사 + 알파 페이드)
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

        // 화합물 이름 팝업 — 대상 셀 중심 위쪽
        if (popup != null) {
            val c = cellCenter(popup.cx.toInt(), snap.height - 1 - popup.cy)
            val py = c.y - cell * 1.4f
            val formStyle = TextStyle(
                fontSize = (cell * 0.42f / density).sp,
                color = Color(0xFFFFCF3D),
                fontWeight = FontWeight.Bold,
            )
            val nameStyle = TextStyle(
                fontSize = (cell * 0.28f / density).sp,
                color = Color.White,
            )
            val formLayout = textMeasurer.measure(popup.formula, formStyle)
            val nameLayout = textMeasurer.measure(popup.nameKr, nameStyle)
            val padH = cell * 0.35f
            val padV = cell * 0.15f
            val boxW = maxOf(formLayout.size.width, nameLayout.size.width) + padH * 2
            val boxH = formLayout.size.height + nameLayout.size.height + padV * 3
            val boxTL = Offset(c.x - boxW / 2, py - boxH / 2)
            drawRoundRect(
                color = Color(0xE01A1A2E),
                topLeft = boxTL,
                size = Size(boxW, boxH),
                cornerRadius = CornerRadius(cell * 0.15f),
            )
            drawRoundRect(
                color = Color(0xFFDCB0FF),
                topLeft = boxTL,
                size = Size(boxW, boxH),
                cornerRadius = CornerRadius(cell * 0.15f),
                style = Stroke(width = 1.5f),
            )
            drawText(
                formLayout,
                topLeft = Offset(c.x - formLayout.size.width / 2, boxTL.y + padV),
            )
            drawText(
                nameLayout,
                topLeft = Offset(c.x - nameLayout.size.width / 2, boxTL.y + padV * 2 + formLayout.size.height),
            )
        }
    }
}

@Composable
private fun RulesOverlay(onClose: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xE0000000))
            .clickable { onClose() },
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF1A1A2E))
                .padding(20.dp),
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
                color = Color(0xFF9AA5B8),
                fontSize = 11.sp,
            )
            Spacer(Modifier.height(16.dp))
            Text(
                "탭 아무 데나 → 닫기",
                color = Color(0xFF9AA5B8),
                fontSize = 11.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.End,
            )
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

