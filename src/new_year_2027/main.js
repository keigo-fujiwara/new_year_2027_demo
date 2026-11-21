import CustomLinkHandler from '../common/custom_link.js?v=20261121055645';
import initLineFollow from './components/line_follow.js?v=20261121055645';
import initFvPattern from './components/fv_patterns.js?v=20261121055645';
import initSchedule from './components/schedule.js?v=20261121055645';
import initCourseModal from './components/course_modal.js?v=20261121055645';
import initVoiceModal from './components/voice_modal.js?v=20261121055645';
import initMarquee from './tools/marquee.js?v=20261121055645';

document.addEventListener('DOMContentLoaded', async () => {
    // ファーストビュー（キャッチコピーの演出）
    initFvPattern();
    // 追従LINEボタン
    initLineFollow();
    // 無限スライド（授業風景・メッセージ）
    initMarquee();
    // 講座詳細モーダル
    initCourseModal();
    // メッセージの全文モーダル
    initVoiceModal();
    // 校舎・日時（JSONから描画）
    await initSchedule();
    // カスタムリンクの実行（スケジュール内の申込ボタンも対象にするため描画後に実行）
    new CustomLinkHandler().applyLinks();
});
