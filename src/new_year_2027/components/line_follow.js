/**
 * 追従LINEボタンの表示制御
 * FV（#firstview）が完全に画面外に出たら .is-visible を付与する
 * （FV内のLINEボタンが見えている間は表示しない）
 */
export default function initLineFollow(
    buttonSelector = '.line-follow',
    fvSelector = '#firstview'
) {
    const button = document.querySelector(buttonSelector);
    if (!button) return;

    const fv = document.querySelector(fvSelector);
    if (!fv || !('IntersectionObserver' in window)) {
        button.classList.add('is-visible');
        return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            button.classList.toggle('is-visible', !entry.isIntersecting);
        },
        { threshold: 0 }
    );
    observer.observe(fv);
}
