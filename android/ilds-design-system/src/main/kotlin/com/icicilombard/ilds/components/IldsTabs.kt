package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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

// Figma set 17667:2334 — mirrors web/Tabs.tsx + lib/ilds_tab.dart.

enum class IldsTabEmphasis { High, Medium }
enum class IldsTabAlignment { Left, Center }

data class IldsTabItem(
    val label: String,
    val icon: (@Composable () -> Unit)? = null,
    val isDisabled: Boolean = false,
)

@Composable
fun IldsTabs(
    tabs: List<IldsTabItem>,
    modifier: Modifier = Modifier,
    selectedIndex: Int? = null,
    defaultSelectedIndex: Int = 0,
    emphasis: IldsTabEmphasis = IldsTabEmphasis.High,
    alignment: IldsTabAlignment = IldsTabAlignment.Left,
    onChange: (Int) -> Unit = {},
) {
    var internalIndex by remember { mutableIntStateOf(defaultSelectedIndex) }
    val activeIndex = selectedIndex ?: internalIndex
    val isHigh = emphasis == IldsTabEmphasis.High

    fun select(index: Int) {
        if (tabs[index].isDisabled) return
        if (selectedIndex == null) internalIndex = index
        onChange(index)
    }

    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = when {
                isHigh && alignment == IldsTabAlignment.Center -> Arrangement.Center
                isHigh -> Arrangement.spacedBy(IldsTokens.sp8)
                alignment == IldsTabAlignment.Center -> Arrangement.Center
                else -> Arrangement.Start
            },
        ) {
            tabs.forEachIndexed { index, tab ->
                IldsTabCell(
                    tab = tab,
                    selected = index == activeIndex,
                    emphasis = emphasis,
                    onClick = { select(index) },
                    modifier = if (!isHigh) Modifier.weight(1f) else Modifier,
                )
            }
        }
        if (!isHigh) {
            HorizontalDivider(color = IldsTokens.neutralCoolgray200, thickness = 1.dp)
        }
    }
}

@Composable
private fun IldsTabCell(
    tab: IldsTabItem,
    selected: Boolean,
    emphasis: IldsTabEmphasis,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(selected, tab.isDisabled, isPressed, emphasis) {
        IldsTabColors.resolve(selected, tab.isDisabled, isPressed, emphasis)
    }

    if (emphasis == IldsTabEmphasis.High) {
        Surface(
            onClick = onClick,
            modifier = modifier.semantics {
                role = Role.Tab
                this.selected = selected
            },
            enabled = !tab.isDisabled,
            interactionSource = interactionSource,
            shape = RoundedCornerShape(IldsTokens.radiusLarge),
            color = colors.background,
            border = BorderStroke(1.dp, colors.border),
        ) {
            TabContent(tab, selected, colors.text, emphasis)
        }
    } else {
        Surface(
            onClick = onClick,
            modifier = modifier.semantics {
                role = Role.Tab
                this.selected = selected
            },
            enabled = !tab.isDisabled,
            interactionSource = interactionSource,
            color = Color.Transparent,
            border = if (selected) {
                BorderStroke(3.dp, colors.border)
            } else {
                BorderStroke(0.dp, Color.Transparent)
            },
            shape = RoundedCornerShape(0.dp),
        ) {
            TabContent(tab, selected, colors.text, emphasis)
        }
    }
}

@Composable
private fun TabContent(
    tab: IldsTabItem,
    selected: Boolean,
    textColor: Color,
    emphasis: IldsTabEmphasis,
) {
    Row(
        modifier = Modifier
            .defaultMinSize(minHeight = 36.dp)
            .padding(horizontal = if (emphasis == IldsTabEmphasis.High) IldsTokens.sp32 else IldsTokens.sp12),
        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        tab.icon?.invoke()
        Text(
            text = tab.label,
            style = TextStyle(
                fontSize = IldsTokens.fontSize14,
                lineHeight = 16.sp,
                fontWeight = if (selected) IldsTokens.fontWeightBold else IldsTokens.fontWeightMedium,
            ),
            color = textColor,
        )
    }
}

@Immutable
private data class IldsTabColors(
    val background: Color,
    val border: Color,
    val text: Color,
) {
    companion object {
        fun resolve(
            selected: Boolean,
            isDisabled: Boolean,
            isPressed: Boolean,
            emphasis: IldsTabEmphasis,
        ): IldsTabColors {
            if (isDisabled) {
                return IldsTabColors(
                    IldsTokens.globalWhite000,
                    IldsTokens.neutralCoolgray200,
                    IldsTokens.neutralCoolgray300,
                )
            }
            return if (emphasis == IldsTabEmphasis.High) {
                if (selected) {
                    IldsTabColors(
                        IldsTokens.primaryOrange500,
                        IldsTokens.primaryOrange500,
                        IldsTokens.globalWhite000,
                    )
                } else {
                    IldsTabColors(
                        if (isPressed) IldsTokens.neutralCoolgray50 else IldsTokens.globalWhite000,
                        IldsTokens.neutralCoolgray200,
                        if (isPressed) IldsTokens.neutralCoolgray900 else IldsTokens.neutralCoolgray800,
                    )
                }
            } else {
                if (selected) {
                    IldsTabColors(
                        Color.Transparent,
                        IldsTokens.primaryOrange500,
                        IldsTokens.primaryOrange500,
                    )
                } else {
                    IldsTabColors(
                        Color.Transparent,
                        Color.Transparent,
                        if (isPressed) IldsTokens.neutralCoolgray900 else IldsTokens.neutralCoolgray800,
                    )
                }
            }
        }
    }
}
