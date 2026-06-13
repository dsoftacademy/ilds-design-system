package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13486:38485 — mirrors web/Radio.tsx + lib/ilds_radio.dart.

enum class IldsRadioSize { Small, Medium, Large }

data class IldsRadioOption<T>(
    val value: T,
    val label: String,
    val isDisabled: Boolean = false,
)

@Composable
fun <T> IldsRadio(
    value: T,
    groupValue: T?,
    onValueChange: (T) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    size: IldsRadioSize = IldsRadioSize.Medium,
    isDisabled: Boolean = false,
    hasError: Boolean = false,
) {
    val metrics = remember(size) { IldsRadioMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val isSelected = value == groupValue
    val colors = remember(isSelected, isDisabled, hasError, isPressed) {
        IldsRadioColors.resolve(isSelected, isDisabled, hasError, isPressed)
    }

    Row(
        modifier = modifier.semantics {
            role = Role.RadioButton
            selected = isSelected
        },
        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Surface(
            onClick = { if (!isDisabled) onValueChange(value) },
            modifier = Modifier.size(metrics.outerSize),
            enabled = !isDisabled,
            interactionSource = interactionSource,
            shape = CircleShape,
            color = colors.background,
            border = BorderStroke(colors.borderWidth, colors.border),
        ) {
            Box(
                modifier = Modifier.size(metrics.outerSize),
                contentAlignment = Alignment.Center,
            ) {
                if (isSelected) {
                    Surface(
                        modifier = Modifier.size(metrics.dotSize),
                        shape = CircleShape,
                        color = colors.dot,
                    ) {}
                }
            }
        }
        if (label != null) {
            Text(
                text = label,
                style = metrics.labelStyle,
                color = colors.label,
            )
        }
    }
}

@Composable
fun <T> IldsRadioGroup(
    options: List<IldsRadioOption<T>>,
    groupValue: T?,
    onValueChange: (T) -> Unit,
    modifier: Modifier = Modifier,
    size: IldsRadioSize = IldsRadioSize.Medium,
    isDisabled: Boolean = false,
    hasError: Boolean = false,
    errorText: String? = null,
    vertical: Boolean = true,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        val layoutModifier = if (vertical) Modifier else Modifier
        Column(
            modifier = layoutModifier,
            verticalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
        ) {
            options.forEach { option ->
                IldsRadio(
                    value = option.value,
                    groupValue = groupValue,
                    onValueChange = onValueChange,
                    label = option.label,
                    size = size,
                    isDisabled = isDisabled || option.isDisabled,
                    hasError = hasError,
                )
            }
        }
        if (hasError && errorText != null) {
            Text(
                text = errorText,
                style = TextStyle(
                    fontSize = IldsTokens.fontSize12,
                    lineHeight = 16.sp,
                    fontWeight = IldsTokens.fontWeightRegular,
                ),
                color = IldsTokens.errorRed600,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Immutable
private data class IldsRadioColors(
    val background: Color,
    val border: Color,
    val borderWidth: Dp,
    val dot: Color,
    val label: Color,
) {
    companion object {
        fun resolve(
            isSelected: Boolean,
            isDisabled: Boolean,
            hasError: Boolean,
            isPressed: Boolean,
        ): IldsRadioColors {
            if (isDisabled) {
                return IldsRadioColors(
                    background = IldsTokens.neutralCoolgray50,
                    border = IldsTokens.neutralCoolgray200,
                    borderWidth = 1.dp,
                    dot = IldsTokens.neutralCoolgray300,
                    label = IldsTokens.neutralCoolgray300,
                )
            }
            if (hasError) {
                return IldsRadioColors(
                    background = IldsTokens.globalWhite000,
                    border = IldsTokens.errorRed600,
                    borderWidth = if (isSelected) 2.dp else 2.dp,
                    dot = IldsTokens.errorRed600,
                    label = IldsTokens.neutralCoolgray900,
                )
            }
            val accent = when {
                isPressed && isSelected -> IldsTokens.primaryOrange600
                isSelected -> IldsTokens.primaryOrange500
                isPressed -> IldsTokens.neutralCoolgray400
                else -> IldsTokens.neutralCoolgray600
            }
            return IldsRadioColors(
                background = IldsTokens.globalWhite000,
                border = accent,
                borderWidth = if (isSelected || isPressed) 2.dp else 1.dp,
                dot = if (isSelected) {
                    if (isPressed) IldsTokens.primaryOrange600 else IldsTokens.primaryOrange500
                } else {
                    Color.Transparent
                },
                label = IldsTokens.neutralCoolgray900,
            )
        }
    }
}

@Immutable
private data class IldsRadioMetrics(
    val outerSize: Dp,
    val dotSize: Dp,
    val labelStyle: TextStyle,
) {
    constructor(size: IldsRadioSize) : this(
        outerSize = when (size) {
            IldsRadioSize.Small -> 16.dp
            IldsRadioSize.Medium -> 20.dp
            IldsRadioSize.Large -> 24.dp
        },
        dotSize = when (size) {
            IldsRadioSize.Small -> 8.dp
            IldsRadioSize.Medium -> 10.dp
            IldsRadioSize.Large -> 12.dp
        },
        labelStyle = TextStyle(
            fontSize = when (size) {
                IldsRadioSize.Small -> IldsTokens.fontSize12
                IldsRadioSize.Medium -> IldsTokens.fontSize14
                IldsRadioSize.Large -> IldsTokens.fontSize16
            },
            lineHeight = when (size) {
                IldsRadioSize.Small -> 16.sp
                IldsRadioSize.Medium -> 18.sp
                IldsRadioSize.Large -> 20.sp
            },
            fontWeight = IldsTokens.fontWeightRegular,
        ),
    )
}
