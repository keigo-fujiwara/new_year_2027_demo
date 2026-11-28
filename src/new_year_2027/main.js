import CustomLinkHandler from '../common/custom_link.js?v=20261128094508';
import initApplyFormLinks from './components/apply_form.js?v=20261128094508';
import initApplyBar from './components/apply_bar.js?v=20261128094508';
import initLineFollow from './components/line_follow.js?v=20261128094508';
import initFvCatch from './components/fv_catch.js?v=20261128094508';
import initSchedule from './components/schedule.js?v=20261128094508';
import initCourseModal from './components/course_modal.js?v=20261128094508';
import initVoiceModal from './components/voice_modal.js?v=20261128094508';
import initMarquee from './tools/marquee.js?v=20261128094508';

document.addEventListener('DOMContentLoaded', async () => {
    // ファーストビュー（キャッチコピーの演出）
    initFvCatch();
    // 追従LINEボタン
    initLineFollow();
    // SPの画面下の固定申込帯（最下部の申込CTAへスクロール）
    initApplyBar();
    // 無限スライド（授業風景・メッセージ）
    initMarquee();
    // 講座詳細モーダル
    initCourseModal();
    // メッセージの全文モーダル
    initVoiceModal();
    // 校舎・日時（JSONから描画）
    await initSchedule();
    // メール申込フォームへのリンク（スケジュール内の申込ボタンも対象にするため描画後に実行）
    initApplyFormLinks();
    // カスタムリンクの実行（フッターの規約類）
    new CustomLinkHandler().applyLinks();
});
