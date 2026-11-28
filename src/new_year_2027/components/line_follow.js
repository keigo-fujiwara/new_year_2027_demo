/**
 * 追従LINEボタンの表示制御
 * FV（#firstview）と、ページ内の「LINEで申し込む」ボタンがどれも画面に見えていないときだけ .is-visible を付与する
 * （同じボタンが2つ並んで見えないようにする）
 */
export default function initLineFollow(
    buttonSelector = '.line-follow',
    fvSelector = '#firstview',
    pageLineSelector = '.cta__btn--line'
) {
    const button = document.querySelector(buttonSelector);
    if (!button) return;

    const targets = [
        document.querySelector(fvSelector),
        ...document.querySelectorAll(pageLineSelector),
    ].filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) {
        button.classList.add('is-visible');
        return;
    }

    const inView = new Set();
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    inView.add(entry.target);
                } else {
                    inView.delete(entry.target);
                }
            });
            button.classList.toggle('is-visible', inView.size === 0);
        },
        { threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
}
