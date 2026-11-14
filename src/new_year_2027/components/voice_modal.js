/**
 * メッセージの全文モーダル
 * - スライド内のカード（.voice-card__button）をタップすると <dialog> を開き、
 *   そのカードの学年・属性・タイトル・本文（全文）を写して表示する
 * - スライドは自動スライドの複製カードも含めるため、クリックはスライド全体で受け取る
 * - モーダル表示中もスライドは止めない
 * - 右上の「−」/ 背景クリック / Escキーで閉じる
 */
const PARTS = ['grade', 'who', 'title', 'text'];

export default function initVoiceModal(
    modalSelector = '#voice-modal',
    sliderSelector = '.voice__slider'
) {
    const modal = document.querySelector(modalSelector);
    const slider = document.querySelector(sliderSelector);
    if (!modal || !slider || typeof modal.showModal !== 'function') return;

    const box = modal.querySelector('.voice-modal__box');
    let lastTrigger = null;

    slider.addEventListener('click', (e) => {
        const button = e.target.closest('.voice-card__button');
        if (!button) return;
        const card = button.closest('.voice-card');
        lastTrigger = button;

        // カードの色（生徒 / 保護者）を引き継ぐ
        box.classList.toggle(
            'voice-modal__box--parent',
            card.classList.contains('voice-card--parent')
        );
        // ページ内のカードの中身をそのまま写す（本文の <br /> を残すため innerHTML）
        PARTS.forEach((part) => {
            modal.querySelector(`.voice-modal__${part}`).innerHTML =
                card.querySelector(`.voice-card__${part}`).innerHTML;
        });

        modal.showModal();
        box.scrollTop = 0;
        document.documentElement.classList.add('is-modal-open');
    });

    modal
        .querySelector('.voice-modal__close')
        .addEventListener('click', () => modal.close());

    // 背景（dialog自体）をクリックしたら閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });

    modal.addEventListener('close', () => {
        document.documentElement.classList.remove('is-modal-open');
        // 複製カード（フォーカス対象外）から開いたときはフォーカスを戻さない
        if (lastTrigger && lastTrigger.tabIndex >= 0) {
            lastTrigger.focus({ preventScroll: true });
        }
    });
}
