/**
 * ファーストビュー パターン1（fv--hero）
 * - キャッチコピーを1文字ずつ打ち込むように表示し、最後にカーソルを点滅させる
 *   （文字は最初から配置しておき、見えない状態から順に表示するので、レイアウトは動かない）
 * - 視覚効果を減らす設定（prefers-reduced-motion）の場合は最初から全文を表示
 * - 比較用（デザイン確定まで）：URL に ?fv=1 を付けたときだけパターン1で表示。通常は従来のデザイン
 */
const TYPE_INTERVAL = 75; // 1文字あたり（ミリ秒）
const LINE_PAUSE = 250; // 改行時の間（ミリ秒）
const START_DELAY = 400; // 表示開始までの間（ミリ秒）

/** 行の文字を1文字ずつ <span> に分ける */
function splitChars(line) {
    const chars = [...line.textContent];
    line.textContent = '';
    return chars.map((ch) => {
        const span = document.createElement('span');
        span.className = 'fv__char';
        span.textContent = ch;
        line.appendChild(span);
        return span;
    });
}

function typeCatch(catchEl) {
    const lines = [...catchEl.querySelectorAll('.fv__catch-line')];
    if (!lines.length) return;

    // 読み上げは全文を1回だけ
    catchEl.setAttribute(
        'aria-label',
        lines.map((line) => line.textContent).join('')
    );

    const cursor = document.createElement('span');
    cursor.className = 'fv__cursor';
    cursor.setAttribute('aria-hidden', 'true');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        lines.at(-1).appendChild(cursor);
        return;
    }

    const steps = lines.flatMap((line, i) =>
        splitChars(line).map((char, j) => ({ char, pause: i > 0 && j === 0 }))
    );
    steps.forEach(({ char }) => char.classList.add('is-hidden'));
    catchEl.classList.add('is-typing');

    let i = 0;
    const next = () => {
        if (i >= steps.length) {
            catchEl.classList.remove('is-typing');
            return;
        }
        const { char } = steps[i];
        char.classList.remove('is-hidden');
        char.after(cursor); // カーソルを今打った文字の後ろへ
        i++;
        const pause = steps[i]?.pause ? LINE_PAUSE : 0;
        setTimeout(next, TYPE_INTERVAL + pause);
    };
    setTimeout(next, START_DELAY);
}

export default function initFvHero(selector = '#firstview') {
    const fv = document.querySelector(selector);
    if (!fv) return;

    // TODO: デザイン確定後に整理（比較用の切り替え）
    if (new URLSearchParams(location.search).get('fv') !== '1') return;
    fv.classList.add('fv--hero');

    const catchEl = fv.querySelector('.fv__catch');
    if (catchEl) typeCatch(catchEl);
}
