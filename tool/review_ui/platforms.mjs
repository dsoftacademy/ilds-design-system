/**
 * Cross-platform component registry for ILDS UI Review Portal previews.
 */

/** @type {Record<string, { name: string; storyId: string; flutter: string; ios: string; android: string }>} */
export const COMPONENTS = {
  button: {
    name: 'Button',
    storyId: 'components-button--primary',
    flutter: 'button',
    ios: 'IldsButton.swift',
    android: 'IldsButton.kt',
  },
  radio: {
    name: 'Radio',
    storyId: 'components-radio--default',
    flutter: 'radio',
    ios: 'IldsRadio.swift',
    android: 'IldsRadio.kt',
  },
  checkbox: {
    name: 'Checkbox',
    storyId: 'components-checkbox--default',
    flutter: 'checkbox',
    ios: 'IldsCheckbox.swift',
    android: 'IldsCheckbox.kt',
  },
  switch: {
    name: 'Switch',
    storyId: 'components-switch--default',
    flutter: 'switch',
    ios: 'IldsSwitch.swift',
    android: 'IldsSwitch.kt',
  },
  textfield: {
    name: 'Text Field',
    storyId: 'components-text-field--default',
    flutter: 'textfield',
    ios: 'IldsTextField.swift',
    android: 'IldsTextField.kt',
  },
  text_area: {
    name: 'Text Area',
    storyId: 'components-text-area--default',
    flutter: 'text_area',
    ios: 'IldsTextArea.swift',
    android: 'IldsTextArea.kt',
  },
  dropdown: {
    name: 'Dropdown',
    storyId: 'components-dropdown--default',
    flutter: 'dropdown',
    ios: 'IldsDropdown.swift',
    android: 'IldsDropdown.kt',
  },
  tab: {
    name: 'Tabs',
    storyId: 'components-tabs--high-emphasis',
    flutter: 'tab',
    ios: 'IldsTabs.swift',
    android: 'IldsTabs.kt',
  },
  pagination: {
    name: 'Pagination',
    storyId: 'components-pagination--default',
    flutter: 'pagination',
    ios: 'IldsPagination.swift',
    android: 'IldsPagination.kt',
  },
  selection_button: {
    name: 'Selection Button',
    storyId: 'components-selection-button--default',
    flutter: 'selection_button',
    ios: 'IldsSelectionButton.swift',
    android: 'IldsSelectionButton.kt',
  },
  badge: {
    name: 'Badge',
    storyId: 'components-badge--default',
    flutter: 'badge',
    ios: 'IldsBadge.swift',
    android: 'IldsBadge.kt',
  },
  chip: {
    name: 'Chip',
    storyId: 'components-chip--default',
    flutter: 'chip',
    ios: 'IldsChip.swift',
    android: 'IldsChip.kt',
  },
  tag: {
    name: 'Tag',
    storyId: 'components-tag--default',
    flutter: 'tag',
    ios: 'IldsTag.swift',
    android: 'IldsTag.kt',
  },
  accordion: {
    name: 'Accordion',
    storyId: 'components-accordion--default',
    flutter: 'accordion',
    ios: 'IldsAccordion.swift',
    android: 'IldsAccordion.kt',
  },
  text_link: {
    name: 'Text Link',
    storyId: 'components-text-link--default',
    flutter: 'text_link',
    ios: 'IldsTextLink.swift',
    android: 'IldsTextLink.kt',
  },
  search: {
    name: 'Search',
    storyId: 'components-search--empty',
    flutter: 'search',
    ios: 'IldsSearch.swift',
    android: 'IldsSearch.kt',
  },
  scrollbar: {
    name: 'Scrollbar',
    storyId: 'components-scrollbar--default',
    flutter: 'scrollbar',
    ios: 'IldsScrollbar.swift',
    android: 'IldsScrollbar.kt',
  },
  toast: {
    name: 'Toast',
    storyId: 'components-toast--default',
    flutter: 'toast',
    ios: 'IldsToast.swift',
    android: 'IldsToast.kt',
  },
};

const DART_TO_SLUG = {
  ilds_button: 'button',
  ilds_radio: 'radio',
  ilds_checkbox: 'checkbox',
  ilds_switch: 'switch',
  ilds_text_field: 'textfield',
  ilds_text_area: 'text_area',
  ilds_dropdown: 'dropdown',
  ilds_tabs: 'tab',
  ilds_pagination: 'pagination',
  ilds_selection_button: 'selection_button',
  ilds_badge: 'badge',
  ilds_chip: 'chip',
  ilds_tag: 'tag',
  ilds_accordion: 'accordion',
  ilds_text_link: 'text_link',
  ilds_search: 'search',
  ilds_scrollbar: 'scrollbar',
  ilds_toast: 'toast',
};

const WEB_FOLDER_TO_SLUG = {
  Button: 'button',
  Radio: 'radio',
  Checkbox: 'checkbox',
  Switch: 'switch',
  TextField: 'textfield',
  TextArea: 'text_area',
  Dropdown: 'dropdown',
  Tabs: 'tab',
  Pagination: 'pagination',
  SelectionButton: 'selection_button',
  Badge: 'badge',
  Chip: 'chip',
  Tag: 'tag',
  Accordion: 'accordion',
  TextLink: 'text_link',
  Search: 'search',
  Scrollbar: 'scrollbar',
  Toast: 'toast',
};

/**
 * @param {string[]} files
 * @returns {string|null}
 */
export function componentSlugFromFiles(files) {
  for (const f of files) {
    const dart = f.match(/^lib\/(ilds_[a-z_]+)\.dart$/);
    if (dart && DART_TO_SLUG[dart[1]]) return DART_TO_SLUG[dart[1]];
    const web = f.match(/^web\/src\/components\/([^/]+)\//);
    if (web && WEB_FOLDER_TO_SLUG[web[1]]) return WEB_FOLDER_TO_SLUG[web[1]];
    for (const [slug, c] of Object.entries(COMPONENTS)) {
      if (f.endsWith(c.ios) || f.endsWith(c.android)) return slug;
    }
  }
  return null;
}

/**
 * @param {string[]} files
 * @returns {Set<'react'|'flutter'|'ios'|'android'>}
 */
export function platformsFromFiles(files) {
  const out = new Set();
  for (const f of files) {
    if (/^web\/src\/components\//.test(f) || /^web\/specs\//.test(f)) out.add('react');
    if (/^lib\/ilds_/.test(f)) out.add('flutter');
    if (/^ios\/Sources\/ILDSDesignSystem\//.test(f)) out.add('ios');
    if (/^android\/ilds-design-system\/src\/main\/kotlin\/.*\/components\//.test(f)) out.add('android');
  }
  return out;
}

/**
 * @param {object} opts
 */
export function buildPlatformPreviews({ slug, platforms, storybookUrl, flutterUrl, chromaticUrl }) {
  if (!slug || !COMPONENTS[slug]) return [];
  const meta = COMPONENTS[slug];
  const list = platforms.size ? [...platforms] : ['react', 'flutter', 'ios', 'android'];
  return list.map((platform) => {
    if (platform === 'react') {
      return {
        platform: 'react',
        label: 'React',
        embedUrl: `${storybookUrl}/iframe.html?id=${meta.storyId}&viewMode=story`,
        openUrl: `${storybookUrl}/?path=/story/${meta.storyId.replace('--', '/')}`,
        kind: 'iframe',
      };
    }
    if (platform === 'flutter') {
      return {
        platform: 'flutter',
        label: 'Flutter',
        embedUrl: `${flutterUrl}/?panel=${meta.flutter}`,
        openUrl: `${flutterUrl}/?panel=${meta.flutter}`,
        kind: 'iframe',
      };
    }
    if (platform === 'ios') {
      return {
        platform: 'ios',
        label: 'iOS (SwiftUI)',
        embedUrl: null,
        openUrl: chromaticUrl,
        kind: 'native',
        hint: `Verify ${meta.name} in ios/Sources/ILDSDesignSystem/${meta.ios} — Xcode preview or iOS compile CI.`,
        sourcePath: `ios/Sources/ILDSDesignSystem/${meta.ios}`,
      };
    }
    return {
      platform: 'android',
      label: 'Android (Compose)',
      embedUrl: null,
      openUrl: chromaticUrl,
      kind: 'native',
      hint: `Verify ${meta.name} in android/.../components/${meta.android} — Android Studio preview or compile CI.`,
      sourcePath: `android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/${meta.android}`,
    };
  });
}

/** @deprecated use componentSlugFromFiles */
export function panelSlugForFiles(files) {
  return componentSlugFromFiles(files);
}
