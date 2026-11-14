/**
 * 日程データ（data/schedule.json）の読み込みと共通処理
 * 校舎・日時セクションと講座モーダルで共有する
 */
const SCHEDULE_URL = '../src/new_year_2027/data/schedule.json?v=20261114050935';
const DOW = ['日', '月', '火', '水', '木', '金', '土'];

let schedulePromise = null;

/** schedule.json を1回だけ取得して使い回す */
export function loadSchedule() {
    if (!schedulePromise) {
        schedulePromise = fetch(SCHEDULE_URL, { cache: 'no-cache' }).then(
            (res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            }
        );
        // 失敗時は次回呼び出しで再取得できるようにする
        schedulePromise.catch(() => {
            schedulePromise = null;
        });
    }
    return schedulePromise;
}

/** "3/20" → { label: "金", modifier: "sat" | "sun" | "" }（祝日は "月・祝" / sun） */
export function getDow(year, md, holidays = []) {
    const [m, d] = md.split('/').map(Number);
    const day = new Date(year, m - 1, d).getDay();
    const isHoliday = holidays.includes(md);
    const label = isHoliday && day !== 0 ? `${DOW[day]}・祝` : DOW[day];
    let modifier = '';
    if (day === 0 || isHoliday) modifier = 'sun';
    else if (day === 6) modifier = 'sat';
    return { label, modifier };
}

export const escapeHtml = (str = '') =>
    String(str).replace(
        /[&<>"']/g,
        (c) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[c]
    );
