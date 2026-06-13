package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
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
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13520:33495 — mirrors web/Checkbox.tsx + lib/ilds_checkbox.dart.

enum class IldsCheckboxSize { Small, Medium, Large }
enum class IldsCheckboxState { Unchecked, Checked, Indeterminate }

@Composable
fun IldsCheckbox(
    state: IldsCheckboxState,
    onStateChange: (IldsCheckboxState) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    size: IldsCheckboxSize = IldsCheckboxSize.Medium,
    isDisabled: Boolean = false,
    hasError: Boolean = false,
    errorText: String? = null,
) {
    val metrics = remember(size) { IldsCheckboxMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val on = state == IldsCheckboxState.Checked || state == IldsCheckboxState.Indeterminate
    val colors = remember(state, isDisabled, hasError, isPressed, on) {
        IldsCheckboxColors.resolve(state, isDisabled, hasError, isPressed, on)
    }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        Row(
            modifier = Modifier.semantics {
                role = Role.Checkbox
                stateDescription = when (state) {
                    IldsCheckboxState.Checked -> "Checked"
                    IldsCheckboxState.Indeterminate -> "Partially checked"
                    IldsCheckboxState.Unchecked -> "Unchecked"
                }
            },
            horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
            verticalAlignment = Alignment.Top,
        ) {
            Surface(
                onClick = {
                    if (!isDisabled) {
                        val next = if (on) IldsCheckboxState.Unchecked else IldsCheckboxState.Checked
                        onStateChange(next)
                    }
                },
                modifier = Modifier.size(metrics.boxSize),
                enabled = !isDisabled,
                interactionSource = interactionSource,
                shape = RoundedCornerShape(metrics.radius),
                color = colors.fill,
                border = BorderStroke(colors.borderWidth, colors.border),
            ) {
                Box(
                    modifier = Modifier.size(metrics.boxSize),
                    contentAlignment = Alignment.Center,
                ) {
                    when (state) {
                        IldsCheckboxState.Indeterminate -> {
                            Surface(
                                modifier = Modifier
                                    .width(metrics.boxSize / 2)
                                    .height(2.dp),
                                color = colors.icon,
                            ) {}
                        }
                        IldsCheckboxState.Checked -> {
                            Icon(
                                imageVector = Icons.Filled.Check,
                                contentDescription = null,
                                tint = colors.icon,
                                modifier = Modifier.size(metrics.iconSize),
                            )
                        }
                        IldsCheckboxState.Unchecked -> Unit
                    }
                }
            }
            if (label != null) {
                Text(
                    text = label,
                    style = metrics.labelStyle,
                    color = colors.label,
                    modifier = Modifier.weight(1f, fill = false),
                )
            }
        }
        if (hasError && errorText != null && !isDisabled) {
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
private data class IldsCheckboxColors(
    val fill: Color,
    val border: Color,
    val borderWidth: Dp,
    val icon: Color,
    val label: Color,
) {
    companion object {
        fun resolve(
            state: IldsCheckboxState,
            isDisabled: Boolean,
            hasError: Boolean,
            isPressed: Boolean,
            on: Boolean,
        ): IldsCheckboxColors {
            if (isDisabled) {
                return IldsCheckboxColors(
                    fill = if (on) IldsTokens.neutralCoolgray200 else IldsTokens.neutralCoolgray50,
                    border = if (on) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray200,
                    borderWidth = 1.dp,
                    icon = IldsTokens.neutralCoolgray400,
                    label = IldsTokens.neutralCoolgray300,
                )
            }
            if (hasError) {
                return IldsCheckboxColors(
                    fill = if (on) IldsTokens.errorRed600 else IldsTokens.globalWhite000,
                    border = IldsTokens.errorRed600,
                    borderWidth = 2.dp,
                    icon = IldsTokens.globalWhite000,
                    label = IldsTokens.neutralCoolgray900,
                )
            }
            if (on) {
                val accent = if (isPressed) IldsTokens.primaryOrange600 else IldsTokens.primaryOrange500
                return IldsCheckboxColors(
                    fill = accent,
                    border = accent,
                    borderWidth = 2.dp,
                    icon = IldsTokens.globalWhite000,
                    label = IldsTokens.neutralCoolgray900,
                )
            }
            return IldsCheckboxColors(
                fill = IldsTokens.globalWhite000,
                border = if (isPressed) IldsTokens.neutralCoolgray400 else IldsTokens.neutralCoolgray600,
                borderWidth = 1.dp,
                icon = Color.Transparent,
                label = IldsTokens.neutralCoolgray900,
            )
        }
    }
}

@Immutable
private data class IldsCheckboxMetrics(
    val boxSize: Dp,
    val iconSize: Dp,
    val radius: Dp,
    val labelStyle: TextStyle,
) {
    constructor(size: IldsCheckboxSize) : this(
        boxSize = when (size) {
            IldsCheckboxSize.Small -> 16.dp
            IldsCheckboxSize.Medium -> 20.dp
            IldsCheckboxSize.Large -> 24.dp
        },
        iconSize = when (size) {
            IldsCheckboxSize.Small -> 11.dp
            IldsCheckboxSize.Medium -> 14.dp
            IldsCheckboxSize.Large -> 17.dp
        },
        radius = when (size) {
            IldsCheckboxSize.Small -> IldsTokens.radiusSmall
            IldsCheckboxSize.Medium, IldsCheckboxSize.Large -> IldsTokens.radiusMedium
        },
        labelStyle = TextStyle(
            fontSize = when (size) {
                IldsCheckboxSize.Small -> IldsTokens.fontSize12
                IldsCheckboxSize.Medium -> IldsTokens.fontSize14
                IldsCheckboxSize.Large -> IldsTokens.fontSize16
            },
            lineHeight = when (size) {
                IldsCheckboxSize.Small -> 16.sp
                IldsCheckboxSize.Medium -> 18.sp
                IldsCheckboxSize.Large -> 20.sp
            },
            fontWeight = IldsTokens.fontWeightRegular,
        ),
    )
}
