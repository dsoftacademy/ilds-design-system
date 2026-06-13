package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13476:22316 — mirrors web/Dropdown.tsx + lib/ilds_dropdown.dart.

enum class IldsDropdownSize { Large, Medium }
enum class IldsDropdownRequiredIndicator { Text, Asterisk }

data class IldsDropdownOption(
    val label: String,
    val value: String,
    val isDisabled: Boolean = false,
)

@Composable
fun IldsDropdown(
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String = "Select option",
    options: List<IldsDropdownOption> = emptyList(),
    selectedValue: String? = null,
    onValueChange: (String) -> Unit = {},
    size: IldsDropdownSize = IldsDropdownSize.Large,
    isRequired: Boolean = false,
    requiredIndicator: IldsDropdownRequiredIndicator = IldsDropdownRequiredIndicator.Text,
    isDisabled: Boolean = false,
    isLoading: Boolean = false,
    isNegative: Boolean = false,
    errorText: String? = null,
    helperText: String? = null,
    prefixIcon: (@Composable () -> Unit)? = null,
    isOpen: Boolean? = null,
    onToggle: (() -> Unit)? = null,
    menuSectionLabel: String? = null,
    showMenuFooter: Boolean = true,
    menuSecondaryLabel: String = "Secondary button",
    menuPrimaryLabel: String = "Primary button",
    onMenuSecondary: (() -> Unit)? = null,
    onMenuPrimary: (() -> Unit)? = null,
) {
    var internalOpen by remember { mutableStateOf(false) }
    val expanded = isOpen ?: internalOpen
    val selectedOption = options.find { it.value == selectedValue }
    val hasError = (isNegative || errorText != null) && !isDisabled
    val helperContent = if (hasError) errorText ?: helperText else helperText

    val triggerHeight = if (size == IldsDropdownSize.Large) 48.dp else 40.dp
    val fontSize = if (size == IldsDropdownSize.Large) IldsTokens.fontSize14 else IldsTokens.fontSize12

    val borderColor = when {
        isDisabled -> IldsTokens.neutralCoolgray300
        isLoading -> IldsTokens.neutralCoolgray500
        hasError -> IldsTokens.errorRed600
        expanded -> IldsTokens.primaryOrange500
        else -> IldsTokens.neutralCoolgray500
    }
    val background = when {
        isDisabled -> IldsTokens.neutralCoolgray200
        else -> IldsTokens.globalWhite000
    }
    val displayColor = if (selectedOption != null) {
        IldsTokens.neutralCoolgray900
    } else {
        IldsTokens.neutralCoolgray500
    }

    fun toggle() {
        if (isDisabled || isLoading) return
        onToggle?.invoke()
        if (isOpen == null) internalOpen = !internalOpen
    }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        if (label != null) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = label,
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize16,
                        lineHeight = 20.sp,
                        fontWeight = IldsTokens.fontWeightBold,
                    ),
                    color = if (isDisabled) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray900,
                )
                if (isRequired) {
                    Text(
                        text = if (requiredIndicator == IldsDropdownRequiredIndicator.Asterisk) "*" else "(required)",
                        style = TextStyle(
                            fontSize = if (requiredIndicator == IldsDropdownRequiredIndicator.Asterisk) {
                                IldsTokens.fontSize12
                            } else {
                                10.sp
                            },
                            fontWeight = if (requiredIndicator == IldsDropdownRequiredIndicator.Asterisk) {
                                IldsTokens.fontWeightBold
                            } else {
                                IldsTokens.fontWeightRegular
                            },
                        ),
                        color = if (requiredIndicator == IldsDropdownRequiredIndicator.Asterisk) {
                            IldsTokens.errorRed700
                        } else {
                            IldsTokens.neutralCoolgray800
                        },
                    )
                }
            }
        }

        Box {
            Surface(
                onClick = { toggle() },
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = label ?: placeholder },
                enabled = !isDisabled && !isLoading,
                shape = RoundedCornerShape(
                    topStart = IldsTokens.radiusMedium,
                    topEnd = IldsTokens.radiusMedium,
                    bottomStart = if (expanded) IldsTokens.radiusNull else IldsTokens.radiusMedium,
                    bottomEnd = if (expanded) IldsTokens.radiusNull else IldsTokens.radiusMedium,
                ),
                color = background,
                border = BorderStroke(if (expanded) 2.dp else 1.dp, borderColor),
            ) {
                Row(
                    modifier = Modifier
                        .defaultMinSize(minHeight = triggerHeight)
                        .padding(horizontal = IldsTokens.sp12),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
                ) {
                    prefixIcon?.invoke()
                    Text(
                        text = selectedOption?.label ?: placeholder,
                        modifier = Modifier.weight(1f),
                        style = TextStyle(
                            fontSize = fontSize,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = displayColor,
                        maxLines = 1,
                    )
                    if (hasError && !isLoading) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = "Error",
                            tint = IldsTokens.errorRed600,
                            modifier = Modifier.size(20.dp),
                        )
                    }
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = IldsTokens.primaryOrange500,
                            strokeWidth = 2.dp,
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Filled.KeyboardArrowDown,
                            contentDescription = if (expanded) "Collapse menu" else "Expand menu",
                            tint = if (expanded) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray500,
                            modifier = Modifier
                                .size(20.dp)
                                .rotate(if (expanded) 180f else 0f),
                        )
                    }
                }
            }

            if (expanded && options.isNotEmpty()) {
                IldsDropdownMenu(
                    sectionLabel = menuSectionLabel,
                    options = options,
                    selectedValue = selectedValue,
                    showFooter = showMenuFooter,
                    secondaryLabel = menuSecondaryLabel,
                    primaryLabel = menuPrimaryLabel,
                    onSelect = { value ->
                        onValueChange(value)
                        if (isOpen == null) internalOpen = false
                    },
                    onSecondary = onMenuSecondary,
                    onPrimary = onMenuPrimary,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }

        if (!isDisabled && helperContent != null) {
            Text(
                text = helperContent,
                style = TextStyle(
                    fontSize = IldsTokens.fontSize12,
                    lineHeight = 16.sp,
                    fontWeight = IldsTokens.fontWeightRegular,
                ),
                color = if (hasError) IldsTokens.errorRed600 else IldsTokens.neutralCoolgray700,
            )
        }
    }
}
