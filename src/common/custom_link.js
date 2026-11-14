import ENV from '../../env.js?v=20261114101143';
/**
 * 環境ごとに適切なバックエンドと接続するリンクを作成する
 * ### 使い方
 * #### [HTML側]
 * ```html
 * <a
 *  data-custom-link
 *  data-path="/lp/trial-lesson"
 *  data-has-refer
 *  href="#">
 *      体験会に申し込む
 *  </a>
 * ```
 * #### [JS側]
 * ```javascript
 *  new CustomLinkHandler().applyLinks();
 * ```
 */
export default class CustomLinkHandler {
    constructor() {
        this.apiUrl = ENV.API_URL;
        this.currentRowPath = `${window.location.origin}${window.location.pathname}`;
    }
    generateUrl(path, hasRefer, lpPath = this.currentRowPath) {
        let url = path.startsWith('/') ? this.apiUrl + path : path;
        if (hasRefer) {
            const sep = url.includes('?') ? '&' : '?';
            url += `${sep}lp_path=${encodeURIComponent(lpPath || '')}`;
        }
        return url;
    }
    applyLinks(selector = '[data-custom-link]') {
        document.querySelectorAll(selector).forEach((link) => {
            const path = link.getAttribute('data-path'); //ドメイン以降の遷移先path
            const hasRefer = link.hasAttribute('data-has-refer'); //[lp_path]パラメータに現在のLPリンクを表示するかどうか？
            const url = this.generateUrl(path, hasRefer);
            link.setAttribute('href', url);
        });
    }
}
