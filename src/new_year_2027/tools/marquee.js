/**
 * 無限スライド（marquee）の補助
 *
 * 前提のHTML: [data-marquee] の中に同じ内容のリストを2つ並べ、CSSで -50% まで流してループさせる。
 *   <div class="xxx__track" data-marquee data-marquee-speed="40">
 *       <ul>...</ul>
 *       <ul aria-hidden="true">...</ul>
 *   </div>
 *
 * リスト1つ分の長さが画面幅より短いと、ループの途中で右端に空白が出る。
 * そこで画面幅を超えるまで中身を継ぎ足し、長さに合わせて速度（px/秒）が一定になるよう
 * アニメーション時間（--marquee-duration）を設定する。画面サイズが変わったら再計算する。
 */
const DEFAULT_SPEED = 40; // px/秒
const MAX_REPEAT = 10;

/** リスト内の画像の読み込みを待つ（幅が確定してから測るため） */
function waitImages(root) {
    const imgs = [...root.querySelectorAll('img')];
    return Promise.all(
        imgs.map((img) =>
            img.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                      img.addEventListener('load', resolve, { once: true });
                      img.addEventListener('error', resolve, { once: true });
                  })
        )
    );
}

/** 継ぎ足し用の複製（読み上げ・フォーカス対象から外す） */
function cloneForFill(item) {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => {
        img.alt = '';
        img.removeAttribute('loading');
    });
    // ボタン・リンクはTabキーで止まらないようにする（クリックは有効のまま）
    clone.querySelectorAll('button, a').forEach((el) => {
        el.tabIndex = -1;
    });
    return clone;
}

function setup(track) {
    const lists = [...track.children];
    if (lists.length < 2) return;
    const originals = [...lists[0].children];
    const speed = Number(track.dataset.marqueeSpeed) || DEFAULT_SPEED;

    const fill = () => {
        // 一旦元の状態に戻してから測り直す
        lists.forEach((list) => {
            [...list.querySelectorAll('[data-marquee-fill]')].forEach((el) =>
                el.remove()
            );
        });

        const target = window.innerWidth * 1.1;
        let repeat = 0;
        while (lists[0].scrollWidth < target && repeat < MAX_REPEAT) {
            lists.forEach((list) => {
                originals.forEach((item) => {
                    const clone = cloneForFill(item);
                    clone.setAttribute('data-marquee-fill', '');
                    list.appendChild(clone);
                });
            });
            repeat++;
        }

        const distance = lists[0].getBoundingClientRect().width;
        track.style.setProperty(
            '--marquee-duration',
            `${Math.max(distance / speed, 10)}s`
        );
    };

    waitImages(lists[0]).then(fill);

    let lastWidth = window.innerWidth;
    let timer = null;
    window.addEventListener('resize', () => {
        if (window.innerWidth === lastWidth) return; // SPのアドレスバー伸縮では再計算しない
        lastWidth = window.innerWidth;
        clearTimeout(timer);
        timer = setTimeout(fill, 200);
    });
}

export default function initMarquee(selector = '[data-marquee]') {
    document.querySelectorAll(selector).forEach(setup);
}
