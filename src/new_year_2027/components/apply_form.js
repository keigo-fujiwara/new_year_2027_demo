/**
 * メールでの申込フォーム（GASのウェブアプリ）へのリンク
 * [data-apply-form] の付いたリンクの href に設定する
 *
 * GASを修正したときは「デプロイ」→「デプロイを管理」で既存のデプロイを編集し、
 * バージョンを「新バージョン」にして更新する（「新しいデプロイ」を作るとURLが変わる）
 */
const APPLY_FORM_URL =
    'https://script.google.com/a/macros/waotech.jp/s/AKfycbzydD2kSPV6HoEC1MaUORdjPjoIK__E3wPv2lEqTVoxNhh6J27DGVrrtwTOJMBtPp8m2Q/exec';

export default function initApplyFormLinks(selector = '[data-apply-form]') {
    document.querySelectorAll(selector).forEach((link) => {
        link.setAttribute('href', APPLY_FORM_URL);
    });
}
