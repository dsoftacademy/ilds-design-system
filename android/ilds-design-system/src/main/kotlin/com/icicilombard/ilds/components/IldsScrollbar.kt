package com.icicilombard.ilds.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma 17730:521 — mirrors web/Scrollbar.tsx + lib/ilds_scrollbar.dart.
// Android Jetpack Compose has no VerticalScrollbar; custom track + thumb overlay.

@Composable
fun IldsScrollbar(
    modifier: Modifier = Modifier,
    semanticLabel: String = "Scrollable content",
    content: @Composable () -> Unit,
) {
    val scrollState = rememberScrollState()
    val density = LocalDensity.current
    val showScrollbar by derivedStateOf { scrollState.maxValue > 0 }
    val trackShape = RoundedCornerShape(IldsTokens.radiusMassive)

    Box(
        modifier = modifier.semantics { contentDescription = semanticLabel },
    ) {
        Box(
            modifier = Modifier
                .verticalScroll(scrollState)
                .semantics(mergeDescendants = true) {},
        ) {
            content()
        }
        if (showScrollbar) {
            BoxWithConstraints(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = IldsTokens.sp4)
                    .width(6.dp)
                    .fillMaxHeight(),
            ) {
                val trackHeightPx = constraints.maxHeight.toFloat()
                val maxScroll = scrollState.maxValue.toFloat().coerceAtLeast(1f)
                val scrollFraction = scrollState.value / maxScroll
                val viewportRatio = trackHeightPx / (trackHeightPx + scrollState.maxValue)
                val minThumbPx = with(density) { 16.dp.toPx() }
                val thumbHeightPx = (trackHeightPx * viewportRatio).coerceAtLeast(minThumbPx)
                val thumbOffsetPx = scrollFraction * (trackHeightPx - thumbHeightPx)
                val thumbHeight = with(density) { thumbHeightPx.toDp() }
                val thumbOffset = with(density) { thumbOffsetPx.toDp() }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(IldsTokens.neutralCoolgray100, trackShape),
                )
                Box(
                    modifier = Modifier
                        .width(6.dp)
                        .height(thumbHeight)
                        .offset(y = thumbOffset)
                        .background(IldsTokens.neutralCoolgray200, trackShape),
                )
            }
        }
    }
}
