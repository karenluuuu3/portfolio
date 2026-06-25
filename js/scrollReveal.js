export function initScrollReveal(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const stagger = options.stagger || 0;
    let revealCount = 0;

    const observer = new IntersectionObserver((entries) => {
        // 按 DOM 順序排序，確保 stagger 方向正確
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => {
                const aTop = a.boundingClientRect.top;
                const bTop = b.boundingClientRect.top;
                return aTop - bTop;
            });

        visible.forEach((entry, i) => {
            setTimeout(() => {
                entry.target.classList.add('is-visible');
            }, stagger * i);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

    elements.forEach(el => observer.observe(el));
}