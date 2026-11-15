/**
 * ファーストビューのデザイン比較（デザイン確定まで）
 * URL の ?fv=<番号> で、従来のデザインの代わりに各パターンで表示する
 *   ?fv=1 … パターン1（fv--hero）：動画を全面に敷き、濃い緑のグラデーションを重ねる
 *   ?fv=2 … パターン2（fv--light）：明るいグラデーション背景に、角丸の枠に入れた動画
 * TODO: デザイン確定後、採用しないパターンとこの切り替えを削除する
 */
import { typeCatch } from './fv_hero.js?v=20261115024159';

const PATTERNS = {
    1: {
        className: 'fv--hero',
        init(fv) {
            const catchEl = fv.querySelector('.fv__catch');
            if (catchEl) typeCatch(catchEl);
        },
    },
    2: {
        className: 'fv--light',
    },
};

export default function initFvPattern(selector = '#firstview') {
    const fv = document.querySelector(selector);
    const pattern = PATTERNS[new URLSearchParams(location.search).get('fv')];
    if (!fv || !pattern) return;
    fv.classList.add(pattern.className);
    pattern.init?.(fv);
}
