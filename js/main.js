import { loadComponents } from './components.js';
import { initMenu } from './menu.js';
import { initCursor } from './cursor.js';
import { initPageTransitions } from './transitions.js';
import { initStickyHeader, initBackToTop } from './header.js';
import { initArchivePage } from './archive.js';
import { initDetailPage } from './detail.js';
import { initAboutPage } from './about.js';

document.addEventListener('DOMContentLoaded', () => {
    // 不依賴 header/footer 的模組，立刻啟動
    initPageTransitions();
    initArchivePage();
    initDetailPage();
    initAboutPage();
    initHeroAnimations();

    // header/footer 載入完成後才初始化相關功能
    loadComponents().then(() => {
        initMenu();
        initCursor();
        initStickyHeader();
        initBackToTop();
    });
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
        heroBg.style.cursor = 'pointer';
        heroBg.addEventListener('click', () => {
            window.location.href = 'archive.html';
        });

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

    initHeroSpotlight();
}

function initHeroSpotlight() {
    const spotlight = document.getElementById('heroSpotlight');
    const heroSection = document.querySelector('.hero-section');
    if (!spotlight || !heroSection) return;

    // 滑鼠進入 hero 區域才啟動
    heroSection.addEventListener('mouseenter', () => {
        spotlight.classList.add('is-active');
    });

    heroSection.addEventListener('mouseleave', () => {
        spotlight.classList.remove('is-active');
    });

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        spotlight.style.background = `radial-gradient(
            circle 400px at ${x}px ${y}px,
            transparent 0%,
            rgba(10, 10, 10, 0.45) 100%
        )`;
    });
}