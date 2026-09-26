package com.elementspuyo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.elementspuyo.core.Element

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                PlaceholderScreen()
            }
        }
    }
}

@Composable
fun PlaceholderScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0D18))
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "원소 뿌요",
            color = Color(0xFFFFCF3D),
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = "game-core: ${Element.playable.size} 원소 로드됨",
            color = Color(0xFFDCB0FF),
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "다음 단계: 필드·볼·낙하 컨트롤 구현 예정",
            color = Color(0xFF9AA5B8),
            fontSize = 12.sp,
        )
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF0D0D18)
@Composable
private fun PlaceholderScreenPreview() {
    MaterialTheme(colorScheme = darkColorScheme()) { PlaceholderScreen() }
}
