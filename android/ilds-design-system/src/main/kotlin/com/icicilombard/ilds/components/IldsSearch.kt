package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13965:16190 — mirrors web/Search.tsx + lib/ilds_search.dart.

@Composable
fun IldsSearch(
    modifier: Modifier = Modifier,
    value: String = "",
    onValueChange: (String) -> Unit = {},
    placeholder: String = "Search",
    isLoading: Boolean = false,
    isDisabled: Boolean = false,
    semanticLabel: String = "Search",
    onSubmit: (String) -> Unit = {},
    onClear: () -> Unit = {},
) {
    var text by remember(value) { mutableStateOf(value) }
    val interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val hasText = text.isNotEmpty()

    val borderColor = when {
        isDisabled -> IldsTokens.neutralCoolgray300
        isFocused -> IldsTokens.primaryOrange600
        hasText -> IldsTokens.neutralCoolgray500
        else -> IldsTokens.neutralCoolgray500
    }
    val borderWidth = if (isFocused && !isDisabled) 2.dp else 1.dp
    val background = when {
        isDisabled -> IldsTokens.neutralCoolgray200
        isFocused -> IldsTokens.neutralCoolgray50
        else -> IldsTokens.neutralCoolgray50
    }
    val iconColor = when {
        isDisabled -> IldsTokens.neutralCoolgray400
        isFocused -> IldsTokens.primaryOrange500
        else -> IldsTokens.neutralCoolgray400
    }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .semantics { contentDescription = semanticLabel },
        shape = RoundedCornerShape(IldsTokens.radiusMedium),
        color = background,
        border = BorderStroke(borderWidth, borderColor),
    ) {
        Row(
            modifier = Modifier
                .defaultMinSize(minHeight = 44.dp)
                .padding(horizontal = IldsTokens.sp12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Filled.Search,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(16.dp),
            )
            BasicTextField(
                value = text,
                onValueChange = {
                    text = it
                    onValueChange(it)
                },
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = IldsTokens.sp8),
                enabled = !isDisabled && !isLoading,
                singleLine = true,
                textStyle = TextStyle(
                    fontSize = IldsTokens.fontSize14,
                    lineHeight = 18.sp,
                    fontWeight = IldsTokens.fontWeightRegular,
                    color = IldsTokens.neutralCoolgray900,
                ),
                cursorBrush = SolidColor(IldsTokens.primaryOrange500),
                interactionSource = interactionSource,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { onSubmit(text) }),
                decorationBox = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (text.isEmpty()) {
                            Text(
                                text = placeholder,
                                style = TextStyle(
                                    fontSize = IldsTokens.fontSize14,
                                    lineHeight = 18.sp,
                                    fontWeight = IldsTokens.fontWeightRegular,
                                ),
                                color = IldsTokens.neutralCoolgray500,
                            )
                        }
                        inner()
                    }
                },
            )
            when {
                isLoading -> CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = IldsTokens.primaryOrange500,
                    strokeWidth = 2.dp,
                )
                hasText && !isDisabled -> IconButton(
                    onClick = {
                        text = ""
                        onValueChange("")
                        onClear()
                    },
                    modifier = Modifier.size(24.dp),
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Clear search",
                        tint = IldsTokens.neutralCoolgray500,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }
        }
    }
}
