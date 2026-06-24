export function initPageTransitions() {
    const overlay = document.getElementById('pageTransition');

    if (overlay) {
        overlay.classList.add('is-loaded');
        overlay.addEventListener('animationend', () => {
            overlay.classList.remove('is-loaded');
        }, { once: true });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;
        if (link.target === '_blank') return;
        if (link.hasAttribute('download')) return;
        if (href.match(/\.(pdf|zip|rar|doc|docx|xls|xlsx)$/i)) return;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
        if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

        e.preventDefault();

        if (overlay) {
            overlay.classList.add('is-entering');
            overlay.addEventListener('animationend', () => {
                window.location.href = href;
            }, { once: true });
        } else {
            window.location.href = href;
        }
    });
}