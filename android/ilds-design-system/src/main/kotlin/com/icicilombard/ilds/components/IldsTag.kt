package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
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

// Figma Tag — mirrors lib/ilds_tag.dart.

enum class IldsTagSize { Medium, Large }

@Composable
fun IldsTag(
    label: String,
    modifier: Modifier = Modifier,
    size: IldsTagSize = IldsTagSize.Medium,
    isActive: Boolean = false,
    isDisabled: Boolean = false,
    onTap: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
    prefixIcon: (@Composable () -> Unit)? = null,
) {
    val metrics = remember(size) { IldsTagMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(isActive, isDisabled, isPressed) {
        IldsTagColors.resolve(isActive, isDisabled, isPressed)
    }
    val interactive = onTap != null && !isDisabled

    val shape = RoundedCornerShape(IldsTokens.radiusMassive)
    val tagModifier = modifier.semantics {
        contentDescription = label
        if (isActive) selected = true
        if (interactive) role = Role.Button
    }
    val tagContent: @Composable () -> Unit = {
        Row(
            modifier = Modifier
                .defaultMinSize(minHeight = metrics.height)
                .padding(horizontal = metrics.horizontalPadding),
            horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            prefixIcon?.invoke()
            Text(
                text = label,
                style = metrics.textStyle,
                color = colors.text,
                maxLines = 1,
            )
            if (onRemove != null) {
                IconButton(
                    onClick = { if (!isDisabled) onRemove() },
                    enabled = !isDisabled,
                    modifier = Modifier.size(metrics.iconSize),
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Remove $label",
                        tint = colors.text,
                        modifier = Modifier.size(metrics.iconSize - 2.dp),
                    )
                }
            }
        }
    }
    if (interactive) {
        Surface(
            onClick = { onTap?.invoke() },
            modifier = tagModifier,
            interactionSource = interactionSource,
            shape = shape,
            color = colors.background,
            border = BorderStroke(colors.borderWidth, colors.border),
            content = tagContent,
        )
    } else {
        Surface(
            modifier = tagModifier,
            shape = shape,
            color = colors.background,
            border = BorderStroke(colors.borderWidth, colors.border),
            content = tagContent,
        )
    }
}

@Immutable
private data class IldsTagColors(
    val background: Color,
    val border: Color,
    val borderWidth: Dp,
    val text: Color,
) {
    companion object {
        fun resolve(isActive: Boolean, isDisabled: Boolean, isPressed: Boolean): IldsTagColors {
            if (isDisabled) {
                return IldsTagColors(
                    IldsTokens.neutralCoolgray50,
                    IldsTokens.neutralCoolgray100,
                    1.dp,
                    IldsTokens.neutralCoolgray300,
                )
            }
            if (isActive) {
                return IldsTagColors(
                    IldsTokens.primaryOrange50,
                    IldsTokens.primaryOrange500,
                    2.dp,
                    IldsTokens.primaryOrange600,
                )
            }
            return IldsTagColors(
                background = if (isPressed) IldsTokens.neutralCoolgray100 else IldsTokens.globalWhite000,
                border = if (isPressed) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray200,
                borderWidth = 1.dp,
                text = if (isPressed) IldsTokens.neutralCoolgray900 else IldsTokens.neutralCoolgray600,
            )
        }
    }
}

@Immutable
private data class IldsTagMetrics(
    val height: Dp,
    val horizontalPadding: Dp,
    val iconSize: Dp,
    val textStyle: TextStyle,
) {
    constructor(size: IldsTagSize) : this(
        height = when (size) {
            IldsTagSize.Medium -> 32.dp
            IldsTagSize.Large -> 40.dp
        },
        horizontalPadding = when (size) {
            IldsTagSize.Medium -> IldsTokens.sp8
            IldsTagSize.Large -> IldsTokens.sp12
        },
        iconSize = 16.dp,
        textStyle = TextStyle(
            fontSize = when (size) {
                IldsTagSize.Medium -> 13.sp
                IldsTagSize.Large -> IldsTokens.fontSize14
            },
            fontWeight = IldsTokens.fontWeightMedium,
        ),
    )
}
