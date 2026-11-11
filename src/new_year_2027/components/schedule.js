/**
 * 校舎・日時セクション
 * data/schedule.json から校舎タブ・日程表・校舎カードを描画する
 *
 * - タブ切替（キーボードの左右キーにも対応）
 * - #schedule-<校舎キー> へのリンクで該当タブを開いてスクロール（FVのエリアリンク用）
 * - 校舎カードの「Googleマップで確認する」で地図を開閉
 */
import { loadSchedule, getDow, escapeHtml } from '../tools/schedule_data.js';

const HASH_PREFIX = '#schedule-';

function renderRow(item, data) {
    const dow = getDow(data.year, item.date, data.holidays || []);
    const badges = item.events
        .map(
            (ev) =>
                `<span class="schedule__badge schedule__badge--${escapeHtml(ev.type)}">${escapeHtml(ev.name)}</span>`
        )
        .join('');
    return `
        <li class="schedule__row">
            <p class="schedule__date">
                ${escapeHtml(item.date)}<span class="schedule__dow${dow.modifier ? ` schedule__dow--${dow.modifier}` : ''}">${dow.label}</span>
            </p>
            <div class="schedule__events">
                <div class="schedule__badges">${badges}</div>
                <p class="schedule__time">${escapeHtml(item.time)}</p>
            </div>
            <p class="schedule__duration">${escapeHtml(item.duration)}</p>
        </li>`;
}

function renderCampusCard(campus) {
    const mapId = `schedule-map-${campus.key}`;
    return `
        <div class="schedule__campus">
            <img class="schedule__campus-photo" src="${escapeHtml(campus.photo)}" alt="${escapeHtml(campus.name)}の外観" loading="lazy" decoding="async" />
            <div class="schedule__campus-body">
                <h3 class="schedule__campus-name">${escapeHtml(campus.name)}</h3>
                <p class="schedule__campus-address">
                    ${escapeHtml(campus.zip)}<br />${campus.address.map(escapeHtml).join('<br />')}
                </p>
                <p class="schedule__campus-access">${campus.access.map(escapeHtml).join('<br />')}</p>
                <button class="schedule__map-toggle" type="button" aria-expanded="false" aria-controls="${mapId}">
                    Googleマップで確認する
                </button>
                <div class="schedule__map" id="${mapId}" hidden>
                    <iframe data-src="${escapeHtml(campus.mapSrc)}" title="${escapeHtml(campus.name)}の地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                </div>
            </div>
        </div>`;
}

function renderPanel(campus, items, data, isActive) {
    const rows = items.map((item) => renderRow(item, data)).join('');
    return `
        <div class="schedule__panel" id="schedule-${campus.key}" role="tabpanel" aria-labelledby="schedule-tab-${campus.key}" ${isActive ? '' : 'hidden'}>
            <div class="schedule__main">
                <ul class="schedule__list">${rows || '<li class="schedule__empty">日程は近日公開予定です</li>'}</ul>
                <a class="schedule__apply" data-custom-link data-path="/lp/trial-lesson" data-has-refer href="#" target="apply_form">この校舎の無料講座に申し込む</a>
            </div>
            ${renderCampusCard(campus)}
        </div>`;
}

function renderTab(campus, isActive) {
    return `
        <button class="schedule__tab" id="schedule-tab-${campus.key}" type="button" role="tab" aria-selected="${isActive}" aria-controls="schedule-${campus.key}" tabindex="${isActive ? 0 : -1}" data-key="${campus.key}">
            <span class="schedule__tab-area">${escapeHtml(campus.area)}</span>
            <span class="schedule__tab-name">${escapeHtml(campus.name)}</span>
        </button>`;
}

function activate(root, key, { focus = false } = {}) {
    const tabs = root.querySelectorAll('.schedule__tab');
    const target = [...tabs].find((t) => t.dataset.key === key);
    if (!target) return false;
    tabs.forEach((tab) => {
        const on = tab === target;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
    });
    root.querySelectorAll('.schedule__panel').forEach((panel) => {
        panel.hidden = panel.id !== `schedule-${key}`;
    });
    if (focus) target.focus();
    return true;
}

function bindEvents(root) {
    const tabList = root.querySelector('.schedule__tabs');

    tabList.addEventListener('click', (e) => {
        const tab = e.target.closest('.schedule__tab');
        if (tab) activate(root, tab.dataset.key);
    });

    tabList.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const tabs = [...root.querySelectorAll('.schedule__tab')];
        const i = tabs.findIndex(
            (t) => t.getAttribute('aria-selected') === 'true'
        );
        const next =
            tabs[
                (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
                    tabs.length
            ];
        activate(root, next.dataset.key, { focus: true });
    });

    // 地図の開閉（iframeは初回に開いたときだけ読み込む）
    root.addEventListener('click', (e) => {
        const btn = e.target.closest('.schedule__map-toggle');
        if (!btn) return;
        const map = document.getElementById(btn.getAttribute('aria-controls'));
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        map.hidden = !open;
        const iframe = map.querySelector('iframe[data-src]');
        if (open && iframe) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
        }
    });

    // #schedule-<key> へのリンク（FVのエリアリンクなど）
    const openFromHash = (hash, smooth) => {
        if (!hash.startsWith(HASH_PREFIX)) return false;
        if (!activate(root, hash.slice(HASH_PREFIX.length))) return false;
        root.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        return true;
    };

    document.addEventListener('click', (e) => {
        const link = e.target.closest(`a[href^="${HASH_PREFIX}"]`);
        if (!link) return;
        if (openFromHash(link.getAttribute('href'), true)) {
            e.preventDefault();
            history.replaceState(null, '', link.getAttribute('href'));
        }
    });

    // 日程の描画でページの高さが変わるため、URLのアンカー位置へスクロールし直す
    if (location.hash && !openFromHash(location.hash, false)) {
        try {
            document.querySelector(location.hash)?.scrollIntoView();
        } catch {
            // セレクタとして不正なハッシュは無視
        }
    }
}

export default async function initSchedule(selector = '#schedule') {
    const root = document.querySelector(selector);
    if (!root) return;

    try {
        const data = await loadSchedule();

        const tabsHtml = data.campuses
            .map((c, i) => renderTab(c, i === 0))
            .join('');
        const panelsHtml = data.campuses
            .map((c, i) =>
                renderPanel(
                    c,
                    data.items.filter((item) => item.campus === c.key),
                    data,
                    i === 0
                )
            )
            .join('');

        root.querySelector('.schedule__tabs').innerHTML = tabsHtml;
        root.querySelector('.schedule__panels').innerHTML = panelsHtml;
        bindEvents(root);
    } catch (err) {
        console.error('[schedule] 日程データの読み込みに失敗しました', err);
        root.querySelector('.schedule__panels').innerHTML =
            '<p class="schedule__error">日程を読み込めませんでした。時間をおいて再度お試しください。</p>';
    }
}
