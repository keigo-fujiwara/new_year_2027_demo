import CustomLinkHandler from '../common/custom_link.js?v=20261115021000';
import initLineFollow from './components/line_follow.js?v=20261115021000';
import initFvHero from './components/fv_hero.js?v=20261115021000';
import initSchedule from './components/schedule.js?v=20261115021000';
import initCourseModal from './components/course_modal.js?v=20261115021000';
import initVoiceModal from './components/voice_modal.js?v=20261115021000';
import initMarquee from './tools/marquee.js?v=20261115021000';

document.addEventListener('DOMContentLoaded', async () => {
    // ファーストビュー（キャッチコピーの演出）
    initFvHero();
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
