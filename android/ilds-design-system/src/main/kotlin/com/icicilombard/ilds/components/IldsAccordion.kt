package com.icicilombard.ilds.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma Accordion — mirrors web/Accordion.tsx + lib/ilds_accordion.dart.

@Composable
fun IldsAccordion(
    title: String,
    modifier: Modifier = Modifier,
    isOpen: Boolean? = null,
    defaultOpen: Boolean = false,
    isDisabled: Boolean = false,
    prefixIcon: (@Composable () -> Unit)? = null,
    prefixNumber: Int? = null,
    onToggle: ((Boolean) -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    var internalOpen by remember { mutableStateOf(defaultOpen) }
    val expanded = isOpen ?: internalOpen

    fun toggle() {
        if (isDisabled) return
        val next = !expanded
        if (isOpen == null) internalOpen = next
        onToggle?.invoke(next)
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { role = Role.Button },
    ) {
        TextButton(
            onClick = { toggle() },
            enabled = !isDisabled,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = IldsTokens.sp16, vertical = IldsTokens.sp12),
                horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (prefixIcon != null) {
                    prefixIcon()
                }
                if (prefixNumber != null) {
                    Text(
                        text = prefixNumber.toString(),
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize14,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightBold,
                        ),
                        color = IldsTokens.neutralCoolgray600,
                    )
                }
                Text(
                    text = title,
                    modifier = Modifier.weight(1f),
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize14,
                        lineHeight = 18.sp,
                        fontWeight = IldsTokens.fontWeightMedium,
                    ),
                    color = if (isDisabled) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray900,
                )
                Icon(
                    imageVector = Icons.Filled.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    tint = IldsTokens.neutralCoolgray600,
                    modifier = Modifier
                        .size(20.dp)
                        .rotate(if (expanded) 180f else 0f),
                )
            }
        }
        HorizontalDivider(color = IldsTokens.neutralCoolgray200, thickness = 1.dp)
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically(),
            exit = shrinkVertically(),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = IldsTokens.sp16, vertical = IldsTokens.sp16),
            ) {
                content()
            }
        }
        if (expanded) {
            HorizontalDivider(color = IldsTokens.neutralCoolgray200, thickness = 1.dp)
        }
    }
}
