/**
 * メールでの申込フォームへのリンク
 * [data-apply-form] の付いたリンクの href に設定する（URLを変えるときはここだけ直す）
 */
const APPLY_FORM_URL =
    'https://beengineer-organization.github.io/trial-lesson/mail-form.html';

export default function initApplyFormLinks(selector = '[data-apply-form]') {
    document.querySelectorAll(selector).forEach((link) => {
        link.setAttribute('href', APPLY_FORM_URL);
    });
}
