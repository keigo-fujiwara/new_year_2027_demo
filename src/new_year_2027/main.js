import CustomLinkHandler from '../common/custom_link.js';
import initLineFollow from './components/line_follow.js';
import initSchedule from './components/schedule.js';
import initCourseModal from './components/course_modal.js';
import initMarquee from './tools/marquee.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 追従LINEボタン
    initLineFollow();
    // 無限スライド（授業風景・メッセージ）
    initMarquee();
    // 講座詳細モーダル
    initCourseModal();
    // 校舎・日時（JSONから描画）
    await initSchedule();
    // カスタムリンクの実行（スケジュール内の申込ボタンも対象にするため描画後に実行）
    new CustomLinkHandler().applyLinks();
});
