/**
 * ILDS UI Review Portal — shared client (header, profiles, notifications).
 */
const PORTAL_TITLE = 'ILDS UI Review Portal';

function $(s, root = document) {
  return root.querySelector(s);
}

export function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function escHtml(s) {
  return escAttr(s);
}

export function headerHtml({ activePage = 'review' } = {}) {
  const logLink =
    activePage === 'log'
      ? '<span class="header-link active">Check log</span>'
      : '<a class="header-link" href="/log">Check log</a>';
  const homeLink =
    activePage === 'review'
      ? '<span class="header-link active">Review</span>'
      : '<a class="header-link" href="/">Review</a>';
  return `
<header class="app-header">
  <h1>${PORTAL_TITLE}</h1>
  <div class="header-spacer"></div>
  ${homeLink}
  ${logLink}
  <select class="profile-select" id="profile-select" aria-label="Reviewer profile"></select>
  <button type="button" class="btn-ghost" id="logout-btn">Logout</button>
</header>
<div class="notify-banner" id="notify-banner" hidden>
  <span>Enable browser alerts when new reviews are ready.</span>
  <button type="button" class="btn-ghost" id="notify-enable">Enable alerts</button>
</div>
<div class="modal-backdrop" id="logout-modal">
  <div class="modal" role="dialog" aria-labelledby="logout-title">
    <h3 id="logout-title">Log out?</h3>
    <p>Removes this profile from the portal. Other saved profiles stay available.</p>
    <div class="modal-actions">
      <button type="button" class="btn-ghost" id="logout-cancel">Cancel</button>
      <button type="button" class="action fail" id="logout-confirm">Logout</button>
    </div>
  </div>
</div>`;
}

export async function initPortal({ activePage = 'review', onProfileChange } = {}) {
  document.title = activePage === 'log' ? `${PORTAL_TITLE} — Decision log` : PORTAL_TITLE;

  const logoutModal = $('#logout-modal');
  $('#logout-btn')?.addEventListener('click', () => logoutModal?.classList.add('open'));
  $('#logout-cancel')?.addEventListener('click', () => logoutModal?.classList.remove('open'));
  $('#logout-confirm')?.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  });

  await refreshProfiles(onProfileChange);
  initNotifications();
}

async function refreshProfiles(onProfileChange) {
  const r = await fetch('/api/profiles', { credentials: 'include' });
  if (r.status === 401) {
    window.location.href = '/login';
    return;
  }
  const d = await r.json();
  const sel = $('#profile-select');
  if (!sel) return;
  sel.innerHTML = '';
  for (const p of d.profiles) {
    const opt = document.createElement('option');
    opt.value = p.login;
    opt.textContent = p.readOnly ? `${p.login} (read-only)` : p.login;
    if (p.login === d.active) opt.selected = true;
    sel.appendChild(opt);
  }
  const add = document.createElement('option');
  add.value = '__add__';
  add.textContent = '+ Add account…';
  sel.appendChild(add);

  sel.onchange = async () => {
    if (sel.value === '__add__') {
      window.location.href = '/login?add=1';
      return;
    }
    const sw = await fetch('/api/switch-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: sel.value }),
      credentials: 'include',
    });
    if (sw.ok) {
      if (onProfileChange) await onProfileChange();
      else window.location.reload();
    }
  };
}

function initNotifications() {
  const banner = $('#notify-banner');
  const btn = $('#notify-enable');
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') return;
  if (Notification.permission === 'denied') return;
  banner.hidden = false;
  btn?.addEventListener('click', async () => {
    const p = await Notification.requestPermission();
    banner.hidden = p === 'granted';
  });
}

/** @param {object} state from /api/state */
export function notifyIfNewItems(state) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const waiting = [
    ...state.prs.filter((p) => p.ready).map((p) => `pr-${p.number}`),
    ...state.queue.filter((q) => q.status === 'pending').map((q) => `q-${q.id}`),
  ];
  const prev = JSON.parse(sessionStorage.getItem('ilds_portal_waiting') || '[]');
  const fresh = waiting.filter((id) => !prev.includes(id));
  if (fresh.length && prev.length >= 0) {
    const n = fresh.length;
    new Notification(PORTAL_TITLE, {
      body: n === 1 ? '1 item needs your review' : `${n} items need your review`,
      tag: 'ilds-review-ready',
    });
  }
  sessionStorage.setItem('ilds_portal_waiting', JSON.stringify(waiting));
}

export function platformPreviewHtml(previews, activePlatform) {
  if (!previews?.length) return '';
  const tabs = previews
    .map(
      (p, i) =>
        `<button type="button" class="platform-tab${(activePlatform || previews[0].platform) === p.platform ? ' active' : ''}" data-platform="${escAttr(p.platform)}">${escHtml(p.label)}</button>`,
    )
    .join('');
  const panels = previews
    .map((p) => {
      const active = (activePlatform || previews[0].platform) === p.platform;
      if (p.kind === 'iframe' && p.embedUrl) {
        return `<div class="platform-panel${active ? ' active' : ''}" data-platform="${escAttr(p.platform)}">
          <iframe class="preview-frame" src="${escAttr(p.embedUrl)}" title="${escAttr(p.label)} preview"></iframe>
          <a class="preview-tab" target="_blank" rel="noopener" href="${escAttr(p.openUrl)}">Open ${escHtml(p.label)} ↗</a>
        </div>`;
      }
      const chromatic = p.openUrl
        ? `<a class="preview-tab" target="_blank" rel="noopener" href="${escAttr(p.openUrl)}">Open Chromatic ↗</a>`
        : '';
      return `<div class="platform-panel native${active ? ' active' : ''}" data-platform="${escAttr(p.platform)}">
        <p class="native-hint">${escHtml(p.hint)}</p>
        <code class="source-path">${escHtml(p.sourcePath)}</code>
        ${chromatic}
      </div>`;
    })
    .join('');
  return `<div class="preview-wrap"><div class="platform-tabs">${tabs}</div>${panels}</div>`;
}

export function bindPlatformTabs(root) {
  root.querySelectorAll('.platform-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const wrap = tab.closest('.preview-wrap');
      if (!wrap) return;
      wrap.querySelectorAll('.platform-tab').forEach((t) => t.classList.toggle('active', t === tab));
      wrap.querySelectorAll('.platform-panel').forEach((p) =>
        p.classList.toggle('active', p.dataset.platform === tab.dataset.platform),
      );
    });
  });
}
