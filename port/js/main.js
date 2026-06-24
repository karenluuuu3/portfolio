import { loadComponents } from './components.js';
import { initMenu } from './menu.js';
import { initCursor } from './cursor.js';
import { initPageTransitions } from './transitions.js';
import { initStickyHeader, initBackToTop } from './header.js';
import { initArchivePage } from './archive.js';
import { initDetailPage } from './detail.js';
import { initAboutPage } from './about.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 載入共用元件
    await loadComponents();

    // 2. 初始化全域功能（每頁都需要）
    initMenu();
    initCursor();
    initPageTransitions();
    initStickyHeader();
    initBackToTop();

    // 3. 根據頁面初始化對應模組
    initArchivePage();
    initDetailPage();
    initAboutPage();

    // 4. 首頁 hero 動畫
    initHeroAnimations();
});

function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const lines = heroTitle.innerHTML.split(/<br\s*\/?>/i);
        heroTitle.innerHTML = lines.map(line =>
            `<span class="line-wrap"><span class="line-inner">${line.trim()}</span></span>`
        ).join('');
    }

    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            heroBg.style.transform = `scale(1.1) translateY(${window.scrollY * 0.35}px)`;
        }, { passive: true });
    }
}