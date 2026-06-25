export function initMenu() {
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (!menuOverlay) return;

    function openMenu() {
        menuOverlay.classList.add('is-open');
        menuOverlay.removeAttribute('aria-hidden');
        menuToggleBtn?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        closeMenuBtn?.focus();
        document.addEventListener('keydown', trapFocus);
        document.addEventListener('keydown', handleEsc);
    }

    function closeMenu() {
        menuOverlay.classList.remove('is-open');
        menuOverlay.setAttribute('aria-hidden', 'true');
        menuToggleBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', trapFocus);
        document.removeEventListener('keydown', handleEsc);
        menuToggleBtn?.focus();
    }

    function handleEsc(e) {
        if (e.key === 'Escape') closeMenu();
    }

    function trapFocus(e) {
        if (e.key !== 'Tab') return;

        const focusable = menuOverlay.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    menuToggleBtn?.addEventListener('click', openMenu);
    closeMenuBtn?.addEventListener('click', closeMenu);
    document.querySelectorAll('.menu-links a').forEach(link =>
        link.addEventListener('click', closeMenu)
    );
}