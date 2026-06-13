package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Mirrors web/TextArea.tsx + lib/ilds_text_area.dart.

@Composable
fun IldsTextArea(
    modifier: Modifier = Modifier,
    value: String = "",
    onValueChange: (String) -> Unit = {},
    label: String? = null,
    placeholder: String? = null,
    helperText: String? = null,
    errorText: String? = null,
    successText: String? = null,
    minLines: Int = 3,
    maxLength: Int? = null,
    showCharCount: Boolean = false,
    isDisabled: Boolean = false,
    isReadOnly: Boolean = false,
    isLoading: Boolean = false,
) {
    var text by remember(value) { mutableStateOf(value) }
    val interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val hasError = errorText != null
    val hasSuccess = successText != null && !hasError
    val interactive = !isDisabled && !isLoading

    val borderColor = when {
        isDisabled -> IldsTokens.neutralCoolgray200
        hasError -> IldsTokens.errorRed600
        isFocused -> IldsTokens.primaryOrange500
        hasSuccess -> IldsTokens.successGreen500
        else -> IldsTokens.neutralCoolgray300
    }
    val borderWidth = if (hasError || isFocused) 2.dp else 1.dp
    val fillColor = when {
        isDisabled || isReadOnly -> IldsTokens.neutralCoolgray50
        else -> IldsTokens.globalWhite000
    }
    val textColor = when {
        isDisabled -> IldsTokens.neutralCoolgray300
        isReadOnly -> IldsTokens.neutralCoolgray500
        else -> IldsTokens.neutralCoolgray900
    }
    val bottomText = errorText ?: successText ?: helperText
    val bottomColor = when {
        hasError -> IldsTokens.errorRed600
        hasSuccess -> IldsTokens.successGreen600
        else -> IldsTokens.neutralCoolgray400
    }

    Column(
        modifier = modifier.semantics {
            contentDescription = label ?: placeholder ?: "Text area"
        },
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        if (label != null) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = IldsTokens.fontSize12,
                    fontWeight = IldsTokens.fontWeightMedium,
                ),
                color = IldsTokens.neutralCoolgray500,
            )
        }
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(IldsTokens.radiusMedium),
            color = fillColor,
            border = BorderStroke(borderWidth, borderColor),
        ) {
            Box(modifier = Modifier.defaultMinSize(minHeight = 128.dp)) {
                BasicTextField(
                    value = text,
                    onValueChange = {
                        val next = if (maxLength != null) it.take(maxLength) else it
                        text = next
                        onValueChange(next)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(
                            horizontal = IldsTokens.sp16,
                            vertical = IldsTokens.sp12,
                        ),
                    enabled = interactive,
                    readOnly = isReadOnly,
                    minLines = minLines,
                    textStyle = TextStyle(
                        fontSize = IldsTokens.fontSize14,
                        lineHeight = 18.sp,
                        fontWeight = IldsTokens.fontWeightRegular,
                        color = textColor,
                    ),
                    cursorBrush = SolidColor(IldsTokens.primaryOrange500),
                    interactionSource = interactionSource,
                    decorationBox = { inner ->
                        Box {
                            if (text.isEmpty() && placeholder != null) {
                                Text(
                                    text = placeholder,
                                    style = TextStyle(
                                        fontSize = IldsTokens.fontSize14,
                                        lineHeight = 18.sp,
                                        fontWeight = IldsTokens.fontWeightRegular,
                                    ),
                                    color = IldsTokens.neutralCoolgray300,
                                )
                            }
                            inner()
                        }
                    },
                )
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier
                            .align(androidx.compose.ui.Alignment.TopEnd)
                            .padding(IldsTokens.sp12)
                            .size(20.dp),
                        color = IldsTokens.primaryOrange500,
                        strokeWidth = 2.dp,
                    )
                }
            }
        }
        if (bottomText != null || (showCharCount && maxLength != null)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                if (bottomText != null) {
                    Text(
                        text = bottomText,
                        modifier = Modifier.weight(1f),
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize12,
                            lineHeight = 16.sp,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = bottomColor,
                    )
                } else {
                    Box(modifier = Modifier.weight(1f))
                }
                if (showCharCount && maxLength != null) {
                    Text(
                        text = "${text.length}/$maxLength",
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize12,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = IldsTokens.neutralCoolgray400,
                    )
                }
            }
        }
    }
}
