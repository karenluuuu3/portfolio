/**
 * PROJECT DETAIL PAGE SCRIPTS
 * 
 * Features:
 * - Scroll progress tracking
 * - Floating info card visibility
 * - Scroll animations (AOS)
 * - Code copy functionality
 * - Image lightbox
 * - Video lazy loading
 */

// =============================================================================
// 檢查是否需要動態載入
// =============================================================================
const urlParams = new URLSearchParams(window.location.search);
const hasProjectId = urlParams.has('id');

console.log('project-detail.js loaded, hasProjectId:', hasProjectId);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================================================
// SCROLL PROGRESS BAR
// =============================================================================

function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;
    
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = `${scrollProgress}%`;
    }
}

// =============================================================================
// FLOATING INFO CARD
// =============================================================================

function initFloatingCard() {
    const infoCard = document.querySelector('.project-info-card');
    const hero = document.querySelector('.project-hero');
    
    if (!infoCard || !hero) return;
    
    const handleScroll = () => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollPosition = window.pageYOffset;
        
        if (scrollPosition < heroBottom - 200) {
            infoCard.style.opacity = '0';
            infoCard.style.pointerEvents = 'none';
        } else {
            infoCard.style.opacity = '1';
            infoCard.style.pointerEvents = 'auto';
        }
    };
    
    window.addEventListener('scroll', debounce(handleScroll, 10));
    handleScroll();
}

// =============================================================================
// ANIMATE ON SCROLL (AOS)
// =============================================================================

function initAOS() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay');
                if (delay) {
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, parseInt(delay));
                } else {
                    entry.target.classList.add('aos-animate');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// =============================================================================
// CODE COPY FUNCTIONALITY
// =============================================================================

function initCodeCopy() {
    const copyButtons = document.querySelectorAll('.code-copy');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const codeBlock = button.closest('.code-showcase').querySelector('code');
            if (!codeBlock) return;
            
            const code = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(code);
                showCopyFeedback(button);
            } catch (err) {
                console.error('Failed to copy code:', err);
                fallbackCopyToClipboard(code);
                showCopyFeedback(button);
            }
        });
    });
}

function showCopyFeedback(button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
    }, 2000);
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
}

// =============================================================================
// IMAGE LIGHTBOX
// =============================================================================

function initLightbox() {
    const galleryImages = document.querySelectorAll('.gallery-item img, .gallery-item-full img');
    
    galleryImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            createLightbox(img.src, img.alt);
        });
    });
}

function createLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <img src="${src}" alt="${alt}">
            <button class="lightbox-close" aria-label="Close lightbox">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;
    
    if (!document.getElementById('lightbox-styles')) {
        const style = document.createElement('style');
        style.id = 'lightbox-styles';
        style.textContent = `
            .lightbox {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            .lightbox-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                cursor: pointer;
            }
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                z-index: 1;
            }
            .lightbox-content img {
                max-width: 100%;
                max-height: 90vh;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .lightbox-close {
                position: absolute;
                top: -50px;
                right: 0;
                background: rgba(232, 232, 232, 0.1);
                border: 1px solid rgba(232, 232, 232, 0.2);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                transition: all 0.3s ease;
            }
            .lightbox-close:hover {
                background: rgba(232, 232, 232, 0.2);
                transform: rotate(90deg);
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @media (max-width: 768px) {
                .lightbox-close {
                    top: 10px;
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    function closeLightbox() {
        lightbox.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(lightbox)) {
                document.body.removeChild(lightbox);
            }
            document.body.style.overflow = '';
        }, 300);
    }
    
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    
    function escHandler(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', escHandler);
        }
    }
    document.addEventListener('keydown', escHandler);
}

// =============================================================================
// VIDEO LAZY LOADING
// =============================================================================

function initVideoLazyLoad() {
    const videos = document.querySelectorAll('video[autoplay]');
    
    if (!videos.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                video.play().catch(err => {
                    console.log('Video autoplay failed:', err);
                });
            } else {
                video.pause();
            }
        });
    }, observerOptions);
    
    videos.forEach(video => {
        observer.observe(video);
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initEnhancedFeatures() {
    console.log('Initializing enhanced features...');
    
    // 這些功能總是需要的
    initFloatingCard();
    initCodeCopy();
    initLightbox();
    initVideoLazyLoad();
    
    // Scroll progress tracking
    window.addEventListener('scroll', debounce(updateScrollProgress, 10));
    updateScrollProgress();
    
    // 如果內容是動態載入的，延遲初始化 AOS
    if (hasProjectId) {
        setTimeout(() => {
            if (typeof initAOS === 'function') {
                initAOS();
            }
        }, 1000);
    } else {
        initAOS();
    }
    
    console.log('Enhanced features initialized ✨');
}

// =============================================================================
// 根據是否有 ID 參數決定初始化時機
// =============================================================================

if (hasProjectId) {
    // 有 ID 參數：等 project-loader 完成後再初始化增強功能
    console.log('Dynamic mode: waiting for project-loader...');
    
    // 延遲初始化，給 project-loader 時間完成
    setTimeout(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initEnhancedFeatures, 800);
            });
        } else {
            setTimeout(initEnhancedFeatures, 800);
        }
    }, 100);
    
} else {
    // 沒有 ID 參數：正常初始化（靜態頁面模式）
    console.log('Static mode: normal initialization');
    
    function init() {
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
        
        initEnhancedFeatures();
        console.log('Project detail page initialized (static mode)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}