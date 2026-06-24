export function initStickyHeader() {
    const mainHeader = document.querySelector('.main-header');
    if (!mainHeader) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            mainHeader.classList.toggle('is-scrolled', window.scrollY > 10);
            ticking = false;
        });
    }, { passive: true });
}

export function initBackToTop() {
    const btn = document.getElementById('floatingTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}