export function initScrollReveal(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const stagger = options.stagger || 0;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, stagger * i);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

    elements.forEach(el => observer.observe(el));
}