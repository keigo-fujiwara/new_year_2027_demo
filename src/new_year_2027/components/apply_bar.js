// SPの画面下の固定申込帯：押すとページ最下部の申込CTAまで下にスクロールする
// CSSの scroll-behavior: smooth だけでは機種によって一瞬で移動するため、JSでスクロールを動かす

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// 移動先の要素が、画面下の固定帯を除いた範囲の中央に来る位置
function targetY(target, bar) {
    const root = document.documentElement;
    const visible = innerHeight - bar.offsetHeight;
    const rect = target.getBoundingClientRect();
    const y = scrollY + rect.top - (visible - rect.height) / 2;
    return Math.max(0, Math.min(y, root.scrollHeight - innerHeight));
}

function scrollToTarget(target, bar) {
    const root = document.documentElement;
    const startY = scrollY;
    const distance = targetY(target, bar) - startY;
    const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.15));
    let startTime = null;
    let frame = 0;

    // スクロール中に画面を触ったら、利用者の操作を優先して止める
    const stop = () => {
        cancelAnimationFrame(frame);
        root.style.scrollBehavior = '';
        removeEventListener('wheel', stop);
        removeEventListener('touchstart', stop);
    };
    addEventListener('wheel', stop, { passive: true });
    addEventListener('touchstart', stop, { passive: true });

    // 1フレームずつの移動に CSS の smooth が重ならないよう、スクロール中だけ外す
    root.style.scrollBehavior = 'auto';

    const step = (now) => {
        startTime ??= now;
        const t = Math.min(1, (now - startTime) / duration);
        scrollTo(0, startY + distance * easeInOut(t));
        if (t < 1) {
            frame = requestAnimationFrame(step);
        } else {
            stop();
        }
    };
    frame = requestAnimationFrame(step);
}

export default function initApplyBar(selector = '.apply-bar') {
    const bar = document.querySelector(selector);
    const link = bar?.querySelector('a[href^="#"]');
    const target = link && document.querySelector(link.getAttribute('href'));
    if (!target) return;

    link.addEventListener('click', (e) => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.preventDefault();
        scrollToTarget(target, bar);
    });
}
