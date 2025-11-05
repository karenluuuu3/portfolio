// ========================
// 自定義光標
// ========================
class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.follower = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.follower.className = 'custom-cursor-follower';
        
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.follower);
        
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;
        
        this.init();
    }
    
    init() {
        // 只在桌面設備啟用
        if (window.innerWidth <= 768) return;
        
        document.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        });
        
        // 懸停效果
        const hoverElements = document.querySelectorAll('a, button, .work-card, .tag');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.follower.classList.remove('hover');
            });
        });
        
        this.animate();
    }
    
    animate() {
        // 光標跟隨
        this.cursor.style.left = this.cursorX + 'px';
        this.cursor.style.top = this.cursorY + 'px';
        
        // 延遲跟隨效果
        this.followerX += (this.cursorX - this.followerX) * 0.1;
        this.followerY += (this.cursorY - this.followerY) * 0.1;
        
        this.follower.style.left = this.followerX + 'px';
        this.follower.style.top = this.followerY + 'px';
        
        requestAnimationFrame(() => this.animate());
    }
}

// ========================
// 波紋效果
// ========================
function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ========================
// 磁吸效果
// ========================
class MagneticButton {
    constructor(element) {
        this.element = element;
        this.boundingRect = element.getBoundingClientRect();
        this.init();
    }
    
    init() {
        this.element.addEventListener('mouseenter', () => {
            this.boundingRect = this.element.getBoundingClientRect();
        });
        
        this.element.addEventListener('mousemove', (e) => {
            const x = e.clientX - this.boundingRect.left - this.boundingRect.width / 2;
            const y = e.clientY - this.boundingRect.top - this.boundingRect.height / 2;
            
            this.element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = '';
        });
    }
}

// ========================
// 滾動顯示動畫
// ========================
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.work-card, .about-item, .presentation-content');
        this.init();
    }
    
    init() {
        this.elements.forEach(el => el.classList.add('fade-in-up'));
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.elements.forEach(el => observer.observe(el));
    }
}

// ========================
// 初始化所有互動
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // 自定義光標
    new CustomCursor();
    
    // 波紋效果
    const rippleButtons = document.querySelectorAll('.view-all-btn, .link-btn, .nav-btn, .contact-link');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
    
    // 磁吸效果
    const magneticElements = document.querySelectorAll('.view-all-btn, .nav-btn');
    magneticElements.forEach(el => {
        el.classList.add('magnetic-btn');
        new MagneticButton(el);
    });
    
    // 滾動顯示
    new ScrollReveal();
});