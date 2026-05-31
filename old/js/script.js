// 頁面切換淡入淡出效果
function initPageTransitions() {
    // 頁面載入時淡入
    window.addEventListener('load', () => {
        document.body.classList.add('fade-in');
    });

    // 點擊連結時淡出
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // 如果是外部連結、錨點或 # 開頭，不處理
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('http') || 
                link.target === '_blank') {
                return;
            }
            
            e.preventDefault();
            document.body.classList.remove('fade-in');
            document.body.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

// 創建浮動元素
function createFloatingElements() {
    const elementCount = 15;
    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDelay = Math.random() * 15 + 's';
        element.style.animationDuration = (Math.random() * 10 + 10) + 's';
        document.body.appendChild(element);
    }
}



// 作品卡片的細微動畫效果
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 為作品卡片添加淡入效果
document.querySelectorAll('.work-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// 滾動指示器隱藏（只在首頁有這個元素）
window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '0.6';
        }
    }
});

// 初始化所有功能
initPageTransitions();
createFloatingElements();