package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma node 16055:6152 — mirrors web/DropdownMenu.tsx.

@Composable
fun IldsDropdownMenu(
    options: List<IldsDropdownOption>,
    modifier: Modifier = Modifier,
    sectionLabel: String? = "Section Label",
    selectedValue: String? = null,
    showFooter: Boolean = true,
    secondaryLabel: String = "Secondary button",
    primaryLabel: String = "Primary button",
    onSelect: (String) -> Unit = {},
    onSecondary: (() -> Unit)? = null,
    onPrimary: (() -> Unit)? = null,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(IldsTokens.radiusMedium),
        color = IldsTokens.globalWhite000,
        shadowElevation = 4.dp,
        border = BorderStroke(1.dp, IldsTokens.neutralCoolgray200),
    ) {
        Column(
            modifier = Modifier.padding(IldsTokens.sp8),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            if (!sectionLabel.isNullOrBlank()) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = IldsTokens.neutralCoolgray100,
                    shape = RoundedCornerShape(IldsTokens.radiusMedium),
                ) {
                    Text(
                        text = sectionLabel,
                        modifier = Modifier.padding(horizontal = IldsTokens.sp8, vertical = IldsTokens.sp12),
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize14,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightBold,
                        ),
                        color = IldsTokens.neutralCoolgray800,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }

            options.forEachIndexed { index, option ->
                val isSelected = option.value == selectedValue
                Surface(
                    onClick = { if (!option.isDisabled) onSelect(option.value) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics {
                            role = Role.Button
                            selected = isSelected
                        },
                    enabled = !option.isDisabled,
                    color = if (isSelected) IldsTokens.primaryOrange50 else IldsTokens.globalWhite000,
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = IldsTokens.sp8, vertical = IldsTokens.sp12),
                        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
                        verticalAlignment = Alignment.Top,
                    ) {
                        Surface(
                            modifier = Modifier.size(20.dp),
                            shape = CircleShape,
                            color = IldsTokens.globalWhite000,
                            border = BorderStroke(
                                1.5.dp,
                                if (isSelected) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray500,
                            ),
                        ) {
                            if (isSelected) {
                                Surface(
                                    modifier = Modifier
                                        .padding(5.dp)
                                        .size(10.dp),
                                    shape = CircleShape,
                                    color = IldsTokens.primaryOrange500,
                                ) {}
                            }
                        }
                        Text(
                            text = option.label,
                            modifier = Modifier.weight(1f),
                            style = TextStyle(
                                fontSize = IldsTokens.fontSize14,
                                lineHeight = 22.sp,
                                fontWeight = if (isSelected) {
                                    IldsTokens.fontWeightBold
                                } else {
                                    IldsTokens.fontWeightRegular
                                },
                            ),
                            color = when {
                                option.isDisabled -> IldsTokens.neutralCoolgray300
                                isSelected -> IldsTokens.primaryOrange500
                                else -> IldsTokens.neutralCoolgray800
                            },
                        )
                    }
                }
                if (index < options.lastIndex) {
                    HorizontalDivider(color = IldsTokens.neutralCoolgray200, thickness = 1.dp)
                }
            }

            if (showFooter) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = IldsTokens.sp8, vertical = IldsTokens.sp12),
                    horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp12),
                ) {
                    IldsButton(
                        label = secondaryLabel,
                        onClick = { onSecondary?.invoke() },
                        modifier = Modifier.weight(1f),
                        type = IldsButtonType.Secondary,
                        size = IldsButtonSize.Medium,
                    )
                    IldsButton(
                        label = primaryLabel,
                        onClick = { onPrimary?.invoke() },
                        modifier = Modifier.weight(1f),
                        type = IldsButtonType.Primary,
                        size = IldsButtonSize.Medium,
                    )
                }
            }
        }
    }
}
