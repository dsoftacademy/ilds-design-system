package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma component set 13472:2804 — mirrors lib/ilds_button.dart + ios/IldsButton.swift.

enum class IldsButtonType { Primary, Secondary, Tertiary }

enum class IldsButtonSize { Large, Medium, Small }

enum class IldsButtonAppearance { Normal, Destructive }

@Composable
fun IldsButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    type: IldsButtonType = IldsButtonType.Primary,
    size: IldsButtonSize = IldsButtonSize.Large,
    appearance: IldsButtonAppearance = IldsButtonAppearance.Normal,
    isDisabled: Boolean = false,
    isLoading: Boolean = false,
    leading: (@Composable () -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
) {
    IldsButtonSurface(
        onClick = onClick,
        modifier = modifier.semantics { contentDescription = label },
        type = type,
        size = size,
        appearance = appearance,
        isDisabled = isDisabled,
        isLoading = isLoading,
        iconOnly = false,
    ) { colors, metrics ->
        val showTrailingIcon = trailing != null && !isLoading
        Row(
            modifier = Modifier.defaultMinSize(minHeight = metrics.minHeight),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (leading != null) {
                RowSlot(size = metrics.iconSlot, contentColor = colors.foreground, content = leading)
                Spacer(modifier = Modifier.size(metrics.gap))
            }
            Text(
                text = label,
                style = metrics.textStyle,
                color = colors.foreground,
                maxLines = 1,
            )
            if (isLoading) {
                Spacer(modifier = Modifier.size(metrics.gap))
                CircularProgressIndicator(
                    modifier = Modifier.size(metrics.iconSlot),
                    color = colors.foreground,
                    strokeWidth = metrics.progressStroke,
                )
            } else if (showTrailingIcon) {
                Spacer(modifier = Modifier.size(metrics.gap))
                RowSlot(size = metrics.iconSlot, contentColor = colors.foreground, content = trailing!!)
            }
        }
    }
}

/** Icon-only button (Figma 13472:2810 L, 13472:3718 S). */
@Composable
fun IldsIconButton(
    onClick: () -> Unit,
    semanticLabel: String,
    icon: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    type: IldsButtonType = IldsButtonType.Primary,
    size: IldsButtonSize = IldsButtonSize.Large,
    appearance: IldsButtonAppearance = IldsButtonAppearance.Normal,
    isDisabled: Boolean = false,
    isLoading: Boolean = false,
) {
    IldsButtonSurface(
        onClick = onClick,
        modifier = modifier.semantics { contentDescription = semanticLabel },
        type = type,
        size = size,
        appearance = appearance,
        isDisabled = isDisabled,
        isLoading = isLoading,
        iconOnly = true,
    ) { colors, metrics ->
        Row(
            modifier = Modifier.defaultMinSize(minHeight = metrics.minHeight),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(metrics.iconSlot),
                    color = colors.foreground,
                    strokeWidth = metrics.progressStroke,
                )
            } else {
                RowSlot(size = metrics.iconSlot, contentColor = colors.foreground, content = icon)
            }
        }
    }
}

@Composable
private fun IldsButtonSurface(
    onClick: () -> Unit,
    modifier: Modifier,
    type: IldsButtonType,
    size: IldsButtonSize,
    appearance: IldsButtonAppearance,
    isDisabled: Boolean,
    isLoading: Boolean,
    iconOnly: Boolean,
    content: @Composable (IldsButtonColors, IldsButtonMetrics) -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val interactive = !isDisabled && !isLoading
    val pressed = isPressed && interactive
    val colors = remember(type, appearance, pressed, isDisabled, isLoading) {
        IldsButtonColors.resolve(type, appearance, pressed, isDisabled, isLoading)
    }
    val metrics = remember(type, size, iconOnly) { IldsButtonMetrics(type, size, iconOnly) }
    val primaryOverlay = IldsButtonColors.primaryPressedOverlay(type, appearance, pressed, isDisabled, isLoading)

    val surfaceColor = if (type == IldsButtonType.Primary && primaryOverlay != null) {
        primaryOverlay
    } else {
        colors.background
    }

    Surface(
        onClick = onClick,
        modifier = modifier,
        enabled = interactive,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(IldsTokens.radiusLarge),
        color = surfaceColor,
        contentColor = colors.foreground,
        border = if (colors.borderWidth > 0.dp && colors.borderColor != null) {
            BorderStroke(colors.borderWidth, colors.borderColor)
        } else {
            null
        },
    ) {
        androidx.compose.foundation.layout.Box(
            modifier = Modifier.padding(metrics.padding),
            contentAlignment = Alignment.Center,
        ) {
            content(colors, metrics)
        }
    }
}

@Composable
private fun RowSlot(
    size: Dp,
    contentColor: Color,
    content: @Composable () -> Unit,
) {
    androidx.compose.foundation.layout.Box(
        modifier = Modifier.size(size),
        contentAlignment = Alignment.Center,
    ) {
        androidx.compose.runtime.CompositionLocalProvider(
            androidx.compose.material3.LocalContentColor provides contentColor,
        ) {
            content()
        }
    }
}

@Immutable
private data class IldsButtonColors(
    val background: Color,
    val foreground: Color,
    val borderColor: Color?,
    val borderWidth: Dp,
) {
    companion object {
        private fun accent(appearance: IldsButtonAppearance): Color =
            if (appearance == IldsButtonAppearance.Normal) IldsTokens.primaryOrange500
            else IldsTokens.errorRed600

        fun primaryPressedOverlay(
            type: IldsButtonType,
            appearance: IldsButtonAppearance,
            isPressed: Boolean,
            isDisabled: Boolean,
            isLoading: Boolean,
        ): Color? {
            if (type != IldsButtonType.Primary || !isPressed || isDisabled || isLoading) return null
            return if (appearance == IldsButtonAppearance.Normal) IldsTokens.primaryOrange600
            else IldsTokens.errorRed700
        }

        fun resolve(
            type: IldsButtonType,
            appearance: IldsButtonAppearance,
            isPressed: Boolean,
            isDisabled: Boolean,
            isLoading: Boolean,
        ): IldsButtonColors {
            val accentColor = accent(appearance)

            if (isDisabled) {
                return when (type) {
                    IldsButtonType.Primary -> IldsButtonColors(
                        IldsTokens.neutralCoolgray400,
                        IldsTokens.globalWhite000,
                        null,
                        0.dp,
                    )
                    IldsButtonType.Secondary -> IldsButtonColors(
                        IldsTokens.neutralCoolgray50,
                        IldsTokens.neutralCoolgray400,
                        IldsTokens.neutralCoolgray400,
                        1.dp,
                    )
                    IldsButtonType.Tertiary -> IldsButtonColors(
                        Color.Transparent,
                        IldsTokens.neutralCoolgray400,
                        null,
                        0.dp,
                    )
                }
            }

            if (isLoading) {
                return when (type) {
                    IldsButtonType.Primary -> IldsButtonColors(accentColor, IldsTokens.globalWhite000, null, 0.dp)
                    IldsButtonType.Secondary -> IldsButtonColors(IldsTokens.globalWhite000, accentColor, accentColor, 1.dp)
                    IldsButtonType.Tertiary -> IldsButtonColors(Color.Transparent, accentColor, null, 0.dp)
                }
            }

            if (isPressed) {
                when (type) {
                    IldsButtonType.Primary -> { /* overlay handles */ }
                    IldsButtonType.Secondary -> {
                        return if (appearance == IldsButtonAppearance.Normal) {
                            IldsButtonColors(
                                IldsTokens.primaryOrange100,
                                IldsTokens.primaryOrange600,
                                IldsTokens.primaryOrange600,
                                1.dp,
                            )
                        } else {
                            IldsButtonColors(
                                IldsTokens.errorRed100,
                                IldsTokens.errorRed700,
                                IldsTokens.errorRed600,
                                1.dp,
                            )
                        }
                    }
                    IldsButtonType.Tertiary -> {
                        return if (appearance == IldsButtonAppearance.Normal) {
                            IldsButtonColors(Color.Transparent, IldsTokens.primaryOrange600, null, 0.dp)
                        } else {
                            IldsButtonColors(Color.Transparent, IldsTokens.errorRed700, null, 0.dp)
                        }
                    }
                }
            }

            return when (type) {
                IldsButtonType.Primary -> IldsButtonColors(accentColor, IldsTokens.globalWhite000, null, 0.dp)
                IldsButtonType.Secondary -> IldsButtonColors(IldsTokens.globalWhite000, accentColor, accentColor, 1.dp)
                IldsButtonType.Tertiary -> IldsButtonColors(Color.Transparent, accentColor, null, 0.dp)
            }
        }
    }
}

@Immutable
private data class IldsButtonMetrics(
    val padding: PaddingValues,
    val gap: Dp,
    val minHeight: Dp,
    val iconSlot: Dp,
    val textStyle: TextStyle,
    val progressStroke: Dp,
) {
    constructor(type: IldsButtonType, size: IldsButtonSize, iconOnly: Boolean) : this(
        padding = buttonPadding(type, size, iconOnly),
        gap = when (size) {
            IldsButtonSize.Large, IldsButtonSize.Medium -> IldsTokens.sp8
            IldsButtonSize.Small -> IldsTokens.sp6
        },
        minHeight = when (size) {
            IldsButtonSize.Large -> 48.dp
            IldsButtonSize.Medium -> 36.dp
            IldsButtonSize.Small -> 28.dp
        },
        iconSlot = when (size) {
            IldsButtonSize.Large -> 24.dp
            IldsButtonSize.Medium -> 20.dp
            IldsButtonSize.Small -> 12.dp
        },
        textStyle = when (size) {
            IldsButtonSize.Large -> TextStyle(
                fontSize = IldsTokens.fontSize16,
                lineHeight = 20.sp,
                fontWeight = IldsTokens.fontWeightBold,
            )
            IldsButtonSize.Medium -> TextStyle(
                fontSize = IldsTokens.fontSize14,
                lineHeight = 16.sp,
                fontWeight = IldsTokens.fontWeightBold,
            )
            IldsButtonSize.Small -> TextStyle(
                fontSize = IldsTokens.fontSize12,
                lineHeight = 16.sp,
                fontWeight = IldsTokens.fontWeightBold,
            )
        },
        progressStroke = when (size) {
            IldsButtonSize.Large -> 2.5.dp
            IldsButtonSize.Medium -> 2.25.dp
            IldsButtonSize.Small -> 2.dp
        },
    )

}

private fun buttonPadding(
    type: IldsButtonType,
    size: IldsButtonSize,
    iconOnly: Boolean,
): PaddingValues {
    if (iconOnly && size == IldsButtonSize.Small) {
        return PaddingValues(horizontal = IldsTokens.sp8, vertical = IldsTokens.sp6)
    }
    if (type == IldsButtonType.Tertiary) {
        return when (size) {
            IldsButtonSize.Large -> PaddingValues(vertical = IldsTokens.sp12)
            IldsButtonSize.Medium -> PaddingValues(vertical = IldsTokens.sp8)
            IldsButtonSize.Small -> PaddingValues(vertical = IldsTokens.sp6)
        }
    }
    return when (size) {
        IldsButtonSize.Large -> PaddingValues(horizontal = IldsTokens.sp16, vertical = IldsTokens.sp12)
        IldsButtonSize.Medium -> PaddingValues(horizontal = IldsTokens.sp12, vertical = IldsTokens.sp8)
        IldsButtonSize.Small -> PaddingValues(horizontal = IldsTokens.sp12, vertical = IldsTokens.sp6)
    }
}
