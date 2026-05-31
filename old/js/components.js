class ComponentLoader {
    constructor() {
        this.init();
    }

    init() {
        this.renderAllComponents();
        this.initScrollBehavior();
    }

    getNavTemplate() {
        return `
            <nav id="navbar">
                <div class="nav-container">
                    <div class="logo">karenlu3.works</div>
                    <button class="menu-toggle" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <ul class="nav-links">
                        <li><a href="index.html#home">HOME</a></li>
                        <li><a href="works.html">WORKS</a></li>
                        <li><a href="index.html#about">ABOUT</a></li>
                        <li><a href="presentations.html">PRESENTATIONS</a></li>
                        <li class="social-icons">
                            <a href="https://www.instagram.com/karenlu3.works/" target="_blank" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="https://www.behance.net/karenlu5" target="_blank" aria-label="Behance">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
                                </svg>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    getFooterTemplate() {
        return `
            <section class="contact" id="contact">
                <h2 class="section-title">CONTACT</h2>
                <div class="contact-links">
                    <a href="https://www.linkedin.com/in/karen-lu-2a6922261" class="contact-link">LINKEDIN</a>
                    <a href="https://www.instagram.com/karenlu3.works/" class="contact-link">INSTAGRAM</a>
                    <a href="https://www.behance.net/karenlu5" class="contact-link">BEHANCE</a>
                </div>
                <p class="copyright">© 2020 – 2025 karenlu3.works </p>
            </section>
        `;
    }

    renderAllComponents() {
        const navPlaceholder = document.querySelector('#nav-placeholder');
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        
        if (navPlaceholder) {
            navPlaceholder.innerHTML = this.getNavTemplate();
            this.initMenuToggle();
        }
        
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = this.getFooterTemplate();
        }
        
        console.log('✅ Components 載入完成');
    }

    initMenuToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (!menuToggle || !navLinks) return;

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // 點擊選單項目後關閉選單
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // 點擊選單外部關閉選單
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    initScrollBehavior() {
        // 滾動時導航欄效果
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;
            
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(250, 250, 250, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
            } else {
                navbar.style.background = 'rgba(250, 250, 250, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });

        // 平滑滾動
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.componentLoader = new ComponentLoader();
});