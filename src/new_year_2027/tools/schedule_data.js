/**
 * 日程データ（data/schedule.json）の読み込みと共通処理
 * 校舎・日時セクションと講座モーダルで共有する
 */
const SCHEDULE_URL = '../src/new_year_2027/data/schedule.json?v=20261128105625';
const COURSES_URL = '../src/new_year_2027/data/courses.json?v=20261128105625';
const DOW = ['日', '月', '火', '水', '木', '金', '土'];

let schedulePromise = null;
let coursesPromise = null;

/** courses.json の講座一覧を1回だけ取得して使い回す */
export function loadCourses() {
    if (!coursesPromise) {
        coursesPromise = fetch(COURSES_URL, { cache: 'no-cache' })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => json.courses);
        coursesPromise.catch(() => {
            coursesPromise = null;
        });
    }
    return coursesPromise;
}

/** 日程の講座名（schedule.json の events[].name）→ 講座ID（courses.json の id） */
export function courseIdsByEventName(courses) {
    return new Map(
        courses.flatMap((course) =>
            course.scheduleEvents.map((name) => [name, course.id])
        )
    );
}

/**
 * "hidden": true の校舎は、その日程も含めて表示しない
 * （開催が未確定の校舎を、データを残したまま一時的に隠すため）
 */
function excludeHiddenCampuses(data) {
    const hiddenKeys = data.campuses.filter((c) => c.hidden).map((c) => c.key);
    return {
        ...data,
        campuses: data.campuses.filter((c) => !c.hidden),
        items: data.items.filter((item) => !hiddenKeys.includes(item.campus)),
    };
}

/** schedule.json を1回だけ取得して使い回す */
export function loadSchedule() {
    if (!schedulePromise) {
        schedulePromise = fetch(SCHEDULE_URL, { cache: 'no-cache' })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(excludeHiddenCampuses);
        // 失敗時は次回呼び出しで再取得できるようにする
        schedulePromise.catch(() => {
            schedulePromise = null;
        });
    }
    return schedulePromise;
}

/** "3/20" → { label: "金", modifier: "sat" | "sun" | "" }（祝日は "月祝" / sun） */
export function getDow(year, md, holidays = []) {
    const [m, d] = md.split('/').map(Number);
    const day = new Date(year, m - 1, d).getDay();
    const isHoliday = holidays.includes(md);
    const label = isHoliday && day !== 0 ? `${DOW[day]}祝` : DOW[day];
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
