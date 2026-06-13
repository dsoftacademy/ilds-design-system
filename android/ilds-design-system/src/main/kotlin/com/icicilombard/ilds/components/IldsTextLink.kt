package com.icicilombard.ilds.components

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13474:16003 — mirrors web/TextLink.tsx + lib/ilds_text_link.dart.

enum class IldsTextLinkSize { Small, Medium, Large }
enum class IldsTextLinkColour { Default, White }

@Composable
fun IldsTextLink(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: IldsTextLinkSize = IldsTextLinkSize.Medium,
    colour: IldsTextLinkColour = IldsTextLinkColour.Default,
    isVisited: Boolean = false,
    isDisabled: Boolean = false,
    prefixIcon: (@Composable () -> Unit)? = null,
    suffixIcon: (@Composable () -> Unit)? = null,
) {
    val metrics = remember(size) { IldsTextLinkMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(colour, isVisited, isDisabled, isPressed) {
        IldsTextLinkColors.resolve(colour, isVisited, isDisabled, isPressed)
    }

    TextButton(
        onClick = onClick,
        modifier = modifier.semantics { role = Role.Button },
        enabled = !isDisabled,
        interactionSource = interactionSource,
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4)) {
            if (prefixIcon != null) {
                Box(modifier = Modifier.semantics(mergeDescendants = true) {}) {
                    prefixIcon()
                }
            }
            Text(
                text = label,
                style = metrics.textStyle.copy(
                    color = colors.text,
                    textDecoration = if (isDisabled) TextDecoration.None else TextDecoration.Underline,
                ),
            )
            if (suffixIcon != null) {
                Box(modifier = Modifier.semantics(mergeDescendants = true) {}) {
                    suffixIcon()
                }
            }
        }
    }
}

@Immutable
private data class IldsTextLinkColors(val text: Color) {
    companion object {
        fun resolve(
            colour: IldsTextLinkColour,
            isVisited: Boolean,
            isDisabled: Boolean,
            isPressed: Boolean,
        ): IldsTextLinkColors {
            if (colour == IldsTextLinkColour.White) {
                val c = when {
                    isDisabled -> IldsTokens.neutralCoolgray400
                    isVisited -> IldsTokens.neutralCoolgray300
                    isPressed -> IldsTokens.neutralCoolgray300
                    else -> IldsTokens.globalWhite000
                }
                return IldsTextLinkColors(c)
            }
            val c = when {
                isDisabled -> IldsTokens.neutralCoolgray300
                isVisited -> IldsTokens.neutralCoolgray500
                isPressed -> IldsTokens.informativeBlue700
                else -> IldsTokens.informativeBlue500
            }
            return IldsTextLinkColors(c)
        }
    }
}

@Immutable
private data class IldsTextLinkMetrics(val textStyle: TextStyle) {
    constructor(size: IldsTextLinkSize) : this(
        textStyle = TextStyle(
            fontSize = when (size) {
                IldsTextLinkSize.Small -> IldsTokens.fontSize12
                IldsTextLinkSize.Medium -> IldsTokens.fontSize14
                IldsTextLinkSize.Large -> IldsTokens.fontSize16
            },
            lineHeight = when (size) {
                IldsTextLinkSize.Small -> 16.sp
                IldsTextLinkSize.Medium -> 18.sp
                IldsTextLinkSize.Large -> 20.sp
            },
            fontWeight = IldsTokens.fontWeightMedium,
        ),
    )
}
