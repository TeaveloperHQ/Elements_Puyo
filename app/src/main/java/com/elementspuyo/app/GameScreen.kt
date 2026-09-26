package com.elementspuyo.app

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import com.elementspuyo.core.TurnResult

/** UI 스냅샷 — Compose 는 클래스 내부 mutation 을 감지 못 하므로 명시적 State 로 감싸야 함. */
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

/** 낙하 중인 볼. targetY 는 착지할 격자 y (0=바닥). */
private data class Falling(
    val element: Element,
    val column: Int,
    val targetY: Int,
)

private fun summarize(r: TurnResult): String? {
    if (r.chainCount == 0) return null
    val names = r.chains.flatMap { it.subsets }
        .mapNotNull { it.nameKr.takeIf { s -> s.isNotEmpty() } }
        .distinct()
        .take(3)
        .joinToString(", ")
    return buildString {
        append("${r.chainCount}연쇄 · +${r.score}")
        if (names.isNotEmpty()) append(" · $names")
    }
}

@Composable
fun GameScreen() {
    var game by remember { mutableStateOf(Game()) }
    var snap by remember { mutableStateOf(game.snap()) }
    var message by remember { mutableStateOf<String?>(null) }
    var falling by remember { mutableStateOf<Falling?>(null) }
    val fallY = remember { Animatable(0f) }

    fun tryDrop(col: Int) {
        if (snap.isGameOver || falling != null) return
        val landingY = game.field.columnHeight(col)
        if (landingY >= snap.height) {
            // 열이 꽉 참 — 즉시 playTurn (게임 오버 판정)
            val r = game.playTurn(col)
            snap = game.snap()
            message = summarize(r)
            return
        }
        falling = Falling(snap.current, col, landingY)
    }

    LaunchedEffect(falling) {
        val f = falling ?: return@LaunchedEffect
        val fromY = snap.height.toFloat()   // 필드 위쪽 밖에서 시작
        fallY.snapTo(fromY)
        val dist = fromY - f.targetY
        val duration = (180 + dist / snap.height * 480).toInt().coerceIn(180, 700)
        fallY.animateTo(
            targetValue = f.targetY.toFloat(),
            animationSpec = tween(duration, easing = LinearOutSlowInEasing),
        )
        val r = game.playTurn(f.column)
        snap = game.snap()
        message = summarize(r)
        falling = null
    }

    fun reset() {
        game = Game()
        snap = game.snap()
        message = null
        falling = null
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0D18))
            .padding(horizontal = 12.dp, vertical = 8.dp),
    ) {
        TopHud(snap.totalScore, snap.current, snap.next)
        Spacer(Modifier.height(10.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center,
        ) {
            FieldView(snap, falling, fallY.value, ::tryDrop)
        }
        MessageBar(message)
        if (snap.isGameOver) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp, bottom = 4.dp),
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
}

@Composable
private fun TopHud(score: Int, current: Element, next: Element) {
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
        }
    }
}

@Composable
private fun LabeledMiniBall(label: String, e: Element) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Color(0xFF9AA5B8), fontSize = 10.sp)
        Spacer(Modifier.height(2.dp))
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(Color(e.periodColor)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                e.label,
                color = Color(0xFF1A1A2E),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun MessageBar(message: String?) {
    Text(
        text = message ?: " ",
        color = Color(0xFFDCB0FF),
        fontSize = 13.sp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun FieldView(
    snap: GameSnapshot,
    falling: Falling?,
    fallingY: Float,
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
        drawRect(
            color = Color(0xFF1A1A2E),
            topLeft = Offset(offX, offY),
            size = Size(fieldW, fieldH),
        )
        // 격자
        val grid = Color(0x1FFFFFFF)
        for (i in 0..snap.width) {
            val x = offX + i * cell
            drawLine(grid, Offset(x, offY), Offset(x, offY + fieldH), 1f)
        }
        for (j in 0..snap.height) {
            val y = offY + j * cell
            drawLine(grid, Offset(offX, y), Offset(offX + fieldW, y), 1f)
        }

        val radius = cell * 0.42f
        val fontPx = cell * 0.30f
        val fontSp = (fontPx / density).sp
        val labelStyle = TextStyle(
            fontSize = fontSp,
            color = Color(0xFF10121A),
            fontWeight = FontWeight.Bold,
        )

        fun drawBall(gridX: Int, gridYFloat: Float, e: Element) {
            val cx = offX + gridX * cell + cell / 2
            val cy = offY + (snap.height - 1 - gridYFloat) * cell + cell / 2
            drawCircle(color = Color(e.periodColor), radius = radius, center = Offset(cx, cy))
            drawCircle(color = Color(0x33000000), radius = radius, center = Offset(cx, cy),
                style = Stroke(width = 1f))
            val layout = textMeasurer.measure(e.label, labelStyle)
            drawText(
                textLayoutResult = layout,
                topLeft = Offset(cx - layout.size.width / 2, cy - layout.size.height / 2),
            )
        }

        // 필드 볼
        for (y in snap.field.indices) {
            for (x in snap.field[y].indices) {
                val e = snap.field[y][x] ?: continue
                drawBall(x, y.toFloat(), e)
            }
        }
        // 낙하 중인 볼
        if (falling != null) {
            drawBall(falling.column, fallingY, falling.element)
        }

        // 낙하 중이면 대상 열에 살짝 하이라이트
        if (falling != null) {
            val x = offX + falling.column * cell
            drawRect(
                color = Color(0x22DCB0FF),
                topLeft = Offset(x, offY),
                size = Size(cell, fieldH),
            )
        }
    }
}
