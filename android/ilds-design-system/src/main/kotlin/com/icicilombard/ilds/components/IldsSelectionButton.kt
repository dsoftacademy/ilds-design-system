package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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

// Figma set 14776:1685 — mirrors web/SelectionButton.tsx + lib/ilds_selection_button.dart.

enum class IldsSelectionButtonSize { Small, Medium, Large }
enum class IldsSelectionButtonVariant { LabelOnly, LabelWithSuffix, IconOnly }

@Composable
fun IldsSelectionButton(
    label: String,
    isSelected: Boolean,
    onPress: () -> Unit,
    modifier: Modifier = Modifier,
    size: IldsSelectionButtonSize = IldsSelectionButtonSize.Medium,
    variant: IldsSelectionButtonVariant = IldsSelectionButtonVariant.LabelOnly,
    isDisabled: Boolean = false,
    suffixIcon: (@Composable () -> Unit)? = null,
    semanticLabel: String? = null,
) {
    val metrics = remember(size) { IldsSelectionButtonMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(isSelected, isDisabled, isPressed) {
        IldsSelectionButtonColors.resolve(isSelected, isDisabled, isPressed)
    }
    val iconOnly = variant == IldsSelectionButtonVariant.IconOnly
    val showSuffix = (variant == IldsSelectionButtonVariant.LabelWithSuffix || iconOnly) && suffixIcon != null
    val a11yLabel = semanticLabel ?: label

    Surface(
        onClick = onPress,
        modifier = modifier
            .semantics {
                contentDescription = a11yLabel
                selected = isSelected
                role = Role.Button
            },
        enabled = !isDisabled,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(IldsTokens.radiusMedium),
        color = colors.background,
        border = BorderStroke(colors.borderWidth, colors.border),
    ) {
        Row(
            modifier = Modifier
                .defaultMinSize(minHeight = metrics.height)
                .padding(horizontal = metrics.horizontalPadding),
            horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (!iconOnly) {
                Text(
                    text = label,
                    style = metrics.textStyle,
                    color = colors.text,
                    maxLines = 1,
                )
            }
            if (showSuffix) {
                suffixIcon?.invoke()
            }
        }
    }
}

@Immutable
private data class IldsSelectionButtonColors(
    val background: Color,
    val border: Color,
    val borderWidth: Dp,
    val text: Color,
) {
    companion object {
        fun resolve(isSelected: Boolean, isDisabled: Boolean, isPressed: Boolean): IldsSelectionButtonColors {
            if (isDisabled) {
                return IldsSelectionButtonColors(
                    IldsTokens.neutralCoolgray50,
                    IldsTokens.neutralCoolgray100,
                    1.dp,
                    IldsTokens.neutralCoolgray300,
                )
            }
            if (isSelected) {
                return IldsSelectionButtonColors(
                    IldsTokens.primaryOrange50,
                    IldsTokens.primaryOrange500,
                    2.dp,
                    IldsTokens.primaryOrange500,
                )
            }
            return IldsSelectionButtonColors(
                background = if (isPressed) IldsTokens.neutralCoolgray100 else IldsTokens.globalWhite000,
                border = if (isPressed) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray200,
                borderWidth = 1.dp,
                text = if (isPressed) IldsTokens.neutralCoolgray900 else IldsTokens.neutralCoolgray600,
            )
        }
    }
}

@Immutable
private data class IldsSelectionButtonMetrics(
    val height: Dp,
    val horizontalPadding: Dp,
    val textStyle: TextStyle,
) {
    constructor(size: IldsSelectionButtonSize) : this(
        height = when (size) {
            IldsSelectionButtonSize.Small -> 32.dp
            IldsSelectionButtonSize.Medium -> 40.dp
            IldsSelectionButtonSize.Large -> 48.dp
        },
        horizontalPadding = when (size) {
            IldsSelectionButtonSize.Small -> IldsTokens.sp8
            IldsSelectionButtonSize.Medium -> IldsTokens.sp12
            IldsSelectionButtonSize.Large -> IldsTokens.sp16
        },
        textStyle = TextStyle(
            fontSize = when (size) {
                IldsSelectionButtonSize.Small -> IldsTokens.fontSize12
                IldsSelectionButtonSize.Medium -> IldsTokens.fontSize14
                IldsSelectionButtonSize.Large -> IldsTokens.fontSize16
            },
            lineHeight = when (size) {
                IldsSelectionButtonSize.Small -> 16.sp
                IldsSelectionButtonSize.Medium -> 18.sp
                IldsSelectionButtonSize.Large -> 20.sp
            },
            fontWeight = IldsTokens.fontWeightMedium,
        ),
    )
}
