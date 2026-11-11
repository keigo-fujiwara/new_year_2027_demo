/**
 * 無料体験講座・無料イベント講座の詳細モーダル
 * - 講座カード（[data-course]）をタップすると <dialog> を開く
 * - 講座の説明・作品は data/courses.json、日程は data/schedule.json から描画
 *   （courses.json の scheduleEvents と schedule.json の events[].name を突き合わせる）
 * - ×ボタン / 背景クリック / Escキーで閉じる
 */
import { loadSchedule, getDow, escapeHtml } from '../tools/schedule_data.js';

const COURSES_URL = '../src/new_year_2027/data/courses.json';

/** "3/22" → "3月22日(月・祝)" */
function formatDate(md, data) {
    const [m, d] = md.split('/');
    const dow = getDow(data.year, md, data.holidays || []);
    return `${Number(m)}月${Number(d)}日(${dow.label})`;
}

/** "14:00-16:00" → "14:00 - 16:00" */
const formatTime = (time) => time.replace(/\s*-\s*/, ' - ');

function renderWorks(course) {
    return course.works
        .map((work) =>
            work.src
                ? `<img class="course-modal__work" src="${escapeHtml(work.src)}" alt="${escapeHtml(work.alt)}" loading="lazy" decoding="async" />`
                : '<div class="course-modal__work course-modal__work--placeholder" aria-hidden="true"></div>'
        )
        .join('');
}

function renderSchedule(course, data) {
    const areas = data.campuses
        .map((campus) => {
            const items = data.items.filter(
                (item) =>
                    item.campus === campus.key &&
                    item.events.some((ev) =>
                        course.scheduleEvents.includes(ev.name)
                    )
            );
            if (!items.length) return '';
            const rows = items
                .map(
                    (item) =>
                        `<li><span class="course-modal__date">${formatDate(item.date, data)}</span><span>${escapeHtml(formatTime(item.time))}</span></li>`
                )
                .join('');
            return `
                <div class="course-modal__area">
                    <p class="course-modal__area-name">${escapeHtml(campus.label || campus.area)}</p>
                    <ul class="course-modal__dates">${rows}</ul>
                </div>`;
        })
        .join('');
    return areas || '<p class="course-modal__empty">日程は近日公開予定です</p>';
}

export default async function initCourseModal(modalSelector = '#course-modal') {
    const modal = document.querySelector(modalSelector);
    const triggers = document.querySelectorAll('[data-course]');
    if (!modal || !triggers.length || typeof modal.showModal !== 'function')
        return;

    let courses = [];
    try {
        const res = await fetch(COURSES_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        courses = (await res.json()).courses;
    } catch (err) {
        console.error('[course_modal] 講座データの読み込みに失敗しました', err);
        return;
    }

    const $ = (sel) => modal.querySelector(sel);
    let lastTrigger = null;

    const open = async (courseId, trigger) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return;
        lastTrigger = trigger;

        $('.course-modal__title').textContent = course.title;
        $('.course-modal__subtitle').textContent =
            course.worksTitle || '過去の参加者の作品';
        $('.course-modal__desc').innerHTML = course.description
            .map((p) => `<p>${escapeHtml(p)}</p>`)
            .join('');
        $('.course-modal__works').innerHTML = renderWorks(course);

        try {
            const data = await loadSchedule();
            $('.course-modal__schedule').innerHTML = renderSchedule(
                course,
                data
            );
        } catch {
            $('.course-modal__schedule').innerHTML =
                '<p class="course-modal__empty">日程を読み込めませんでした。校舎・日時をご確認ください。</p>';
        }

        modal.showModal();
        $('.course-modal__box').scrollTop = 0;
        document.documentElement.classList.add('is-modal-open');
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () =>
            open(trigger.dataset.course, trigger)
        );
    });

    $('.course-modal__close').addEventListener('click', () => modal.close());

    // 背景（dialog自体）をクリックしたら閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });

    modal.addEventListener('close', () => {
        document.documentElement.classList.remove('is-modal-open');
        lastTrigger?.focus();
    });
}
