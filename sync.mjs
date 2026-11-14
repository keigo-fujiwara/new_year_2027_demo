/**
 * 2027春LP 確認用リポジトリへの反映スクリプト
 *
 * 使い方（このフォルダで実行）:
 *   node sync.mjs
 *
 * やること:
 *   1. 元プロジェクトの SCSS をコンパイル
 *   2. 確認に必要なファイルだけをこのフォルダへコピー（前回分は削除してから）
 *   3. コピーしたHTMLから計測タグ・本番API連携を外し、noindex を付ける
 *   4. 確認用の env.js / index.html / robots.txt / .nojekyll を作成
 *
 * 元プロジェクトのファイルは一切変更しない（CSSのコンパイル結果のみ更新される）。
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(HERE, '../BeEngineer_Web_LP');
const SRC_PUBLIC = path.join(SOURCE, 'public');
const PAGE = 'pages/new_year_2027.html';

// public/ からの相対パスで、コピーするファイル・フォルダ
const COPY_LIST = [
    PAGE,
    'css/new_year_2027.css',
    'src/new_year_2027',
    'src/common/custom_link.js',
    'assets/images/new_year_2027',
    'assets/videos/new_year_2026/first-view_pc.mp4',
];

// 毎回作り直すフォルダ（このフォルダ直下）
const GENERATED_DIRS = ['pages', 'css', 'src', 'assets'];

// ---------- 1. SCSS コンパイル ----------
console.log('SCSS をコンパイル中...');
execSync(
    'npx sass scss/new_year_2027/main.scss public/css/new_year_2027.css --style=expanded --no-source-map',
    { cwd: SOURCE, stdio: 'inherit' }
);

// ---------- 2. コピー ----------
for (const dir of GENERATED_DIRS) {
    fs.rmSync(path.join(HERE, dir), { recursive: true, force: true });
}
for (const rel of COPY_LIST) {
    const from = path.join(SRC_PUBLIC, rel);
    const to = path.join(HERE, rel);
    if (!fs.existsSync(from)) throw new Error(`見つかりません: ${from}`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true });
}
console.log('ファイルをコピーしました');

// ---------- 3. HTML の加工 ----------
const pagePath = path.join(HERE, PAGE);
let html = fs.readFileSync(pagePath, 'utf8');

// 計測タグ（GTM / GA / Facebook / Clarity）と本番APIを呼ぶ最新LPモーダルを除去
const BLOCK_PATTERNS = /googletagmanager|gtag\(|fbq|facebook|clarity|latest-lp-modal/;
html = html.replace(/[ \t]*<script\b[^>]*>[\s\S]*?<\/script>\s*\n/g, (block) =>
    BLOCK_PATTERNS.test(block) ? '' : block
);
html = html.replace(/[ \t]*<noscript\b[^>]*>[\s\S]*?<\/noscript>\s*\n/g, (block) =>
    BLOCK_PATTERNS.test(block) ? '' : block
);
html = html.replace(/[ \t]*<latest-lp-modal><\/latest-lp-modal>\s*\n/g, '');

// 検索エンジンに載せない
html = html.replace(
    /(<meta charset="UTF-8" \/>\n)/,
    '$1        <meta name="robots" content="noindex, nofollow" />\n'
);

if (BLOCK_PATTERNS.test(html)) {
    throw new Error('計測タグの除去に失敗しました（HTMLの構造が変わった可能性があります）');
}
fs.writeFileSync(pagePath, html);

// custom_link.js は本番ではドメイン直下の env.js を読む（../../../env.js）。
// GitHub Pages ではリポジトリ名のサブパス配下になるため、サイト内の env.js を読むよう書き換える
const linkPath = path.join(HERE, 'src/common/custom_link.js');
fs.writeFileSync(
    linkPath,
    fs
        .readFileSync(linkPath, 'utf8')
        .replace("from '../../../env.js'", "from '../../env.js'")
);

// キャッシュ対策：GitHub Pages は配信サーバー側で最大10分キャッシュするため、
// 反映のたびに CSS / JS / JSON の URL に ?v=<反映日時> を付けて必ず最新を読ませる
const VERSION = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14);
const addVersion = (text) =>
    text.replace(
        /((?:\.\.?\/)[^'"`\s?]+\.(?:css|js|json))(['"`])/g,
        `$1?v=${VERSION}$2`
    );
fs.writeFileSync(pagePath, addVersion(fs.readFileSync(pagePath, 'utf8')));
const walkJs = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walkJs(p) : p.endsWith('.js') ? [p] : [];
    });
for (const file of walkJs(path.join(HERE, 'src'))) {
    fs.writeFileSync(file, addVersion(fs.readFileSync(file, 'utf8')));
}
console.log(`HTML/JS を確認用に加工しました（キャッシュ対策 v=${VERSION}）`);

// ---------- 4. 確認用ファイル ----------
// 本番の env.js は使わない（申込リンクは確認環境では遷移先なし）
fs.writeFileSync(
    path.join(HERE, 'env.js'),
    `// 確認用（本番の env.js ではありません）
const ENV = {
    API_URL: '',
    STAGE: 'preview',
};

export default ENV;
`
);

fs.writeFileSync(
    path.join(HERE, 'index.html'),
    `<!doctype html>
<html lang="ja">
    <head>
        <meta charset="UTF-8" />
        <meta name="robots" content="noindex, nofollow" />
        <meta http-equiv="refresh" content="0; url=./${PAGE}" />
        <title>LP確認用</title>
    </head>
    <body>
        <a href="./${PAGE}">2027春LPを開く</a>
    </body>
</html>
`
);

fs.writeFileSync(path.join(HERE, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(HERE, '.nojekyll'), '');

console.log('完了: index.html を開くと2027春LPへ移動します');
