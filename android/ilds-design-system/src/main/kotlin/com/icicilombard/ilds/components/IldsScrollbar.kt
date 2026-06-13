package com.icicilombard.ilds.components

import androidx.compose.foundation.VerticalScrollbar
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.rememberScrollbarAdapter
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma 17730:521 — mirrors web/Scrollbar.tsx + lib/ilds_scrollbar.dart.

@Composable
fun IldsScrollbar(
    modifier: Modifier = Modifier,
    semanticLabel: String = "Scrollable content",
    content: @Composable () -> Unit,
) {
    val scrollState = rememberScrollState()

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
        VerticalScrollbar(
            adapter = rememberScrollbarAdapter(scrollState),
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterEnd),
            reverseLayout = false,
            style = androidx.compose.foundation.ScrollbarStyle(
                minimalHeight = 16.dp,
                thickness = 6.dp,
                shape = androidx.compose.foundation.shape.RoundedCornerShape(IldsTokens.radiusMassive),
                hoverDurationMillis = 0,
                unhoverColor = IldsTokens.neutralCoolgray200,
                hoverColor = IldsTokens.neutralCoolgray300,
            ),
        )
    }
}
