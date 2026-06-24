import { loadComponents } from './components.js';
import { initMenu } from './menu.js';
import { initCursor } from './cursor.js';
import { initPageTransitions } from './transitions.js';
import { initStickyHeader, initBackToTop } from './header.js';
import { initArchivePage } from './archive.js';
import { initDetailPage } from './detail.js';
import { initAboutPage } from './about.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 載入共用 header / footer
    await loadComponents();

    // 2. 全域功能
    initMenu();
    initCursor();
    initPageTransitions();
    initStickyHeader();
    initBackToTop();

    // 3. 頁面專屬模組（各自判斷 DOM 是否存在）
    initArchivePage();
    initDetailPage();
    initAboutPage();

    // 4. 首頁 hero
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
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                heroBg.style.transform = `scale(1.1) translateY(${window.scrollY * 0.35}px)`;
                ticking = false;
            });
        }, { passive: true });
    }
}