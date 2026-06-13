package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma "Tag" filter chip — component set 14018:6786; mirrors lib/ilds_chip.dart + ios/IldsChip.swift.

enum class IldsChipSize { Large, Medium }

@Composable
fun IldsChip(
    label: String,
    modifier: Modifier = Modifier,
    size: IldsChipSize = IldsChipSize.Large,
    isSelected: Boolean = false,
    isDisabled: Boolean = false,
    hasPrefixIcon: Boolean = false,
    prefixIcon: (@Composable () -> Unit)? = null,
    hasSuffixButton: Boolean = false,
    onPress: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
) {
    val colors = IldsChipColors.resolve(isSelected, isDisabled)
    val metrics = IldsChipMetrics(size)
    val shape = RoundedCornerShape(IldsTokens.radiusMedium)
    val interactive = !isDisabled && onPress != null && !hasSuffixButton

    Surface(
        modifier = modifier
            .semantics {
                contentDescription = "$label chip"
                if (isSelected) selected = true
                if (interactive) role = Role.Button
            }
            .then(
                if (interactive) {
                    Modifier.clickable(enabled = true, onClick = onPress!!)
                } else {
                    Modifier
                },
            ),
        shape = shape,
        color = colors.background,
        border = BorderStroke(0.5.dp, colors.border),
    ) {
        Row(
            modifier = Modifier
                .height(metrics.height)
                .padding(metrics.padding),
            horizontalArrangement = Arrangement.spacedBy(metrics.gap),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (hasPrefixIcon && prefixIcon != null) {
                androidx.compose.runtime.CompositionLocalProvider(
                    LocalContentColor provides colors.label,
                ) {
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .size(metrics.iconSlot)
                            .padding(top = 2.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        prefixIcon()
                    }
                }
            }
            Text(
                text = label,
                style = metrics.textStyle,
                color = colors.label,
                maxLines = 1,
            )
            if (hasSuffixButton) {
                IconButton(
                    onClick = { if (!isDisabled) onRemove?.invoke() },
                    enabled = !isDisabled,
                    modifier = Modifier.size(metrics.iconSlot),
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Remove $label",
                        tint = colors.label,
                        modifier = Modifier.size(metrics.iconSlot - 2.dp),
                    )
                }
            }
        }
    }
}

@Immutable
private data class IldsChipColors(
    val background: Color,
    val border: Color,
    val label: Color,
) {
    companion object {
        fun resolve(isSelected: Boolean, isDisabled: Boolean): IldsChipColors {
            if (isDisabled) {
                return IldsChipColors(
                    IldsTokens.neutralCoolgray200,
                    IldsTokens.neutralCoolgray300,
                    IldsTokens.neutralCoolgray500,
                )
            }
            if (isSelected) {
                return IldsChipColors(
                    IldsTokens.primaryOrange50,
                    IldsTokens.primaryOrange500,
                    IldsTokens.neutralCoolgray900,
                )
            }
            return IldsChipColors(
                IldsTokens.globalWhite000,
                IldsTokens.neutralCoolgray500,
                IldsTokens.neutralCoolgray900,
            )
        }
    }
}

@Immutable
private data class IldsChipMetrics(
    val height: Dp,
    val padding: PaddingValues,
    val gap: Dp,
    val iconSlot: Dp,
    val textStyle: TextStyle,
) {
    constructor(size: IldsChipSize) : this(
        height = when (size) {
            IldsChipSize.Large -> 24.dp
            IldsChipSize.Medium -> 20.dp
        },
        padding = when (size) {
            IldsChipSize.Large -> PaddingValues(horizontal = IldsTokens.sp8, vertical = IldsTokens.sp4)
            IldsChipSize.Medium -> PaddingValues(horizontal = IldsTokens.sp4, vertical = IldsTokens.sp2)
        },
        gap = when (size) {
            IldsChipSize.Large -> IldsTokens.sp4
            IldsChipSize.Medium -> IldsTokens.sp2
        },
        iconSlot = 12.dp,
        textStyle = TextStyle(
            fontSize = IldsTokens.fontSize12,
            lineHeight = 16.sp,
            fontWeight = IldsTokens.fontWeightRegular,
        ),
    )
}
