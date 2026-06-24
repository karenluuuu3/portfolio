export function initMenu() {
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (!menuOverlay) return;

    function openMenu() {
        menuOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    menuToggleBtn?.addEventListener('click', openMenu);
    closeMenuBtn?.addEventListener('click', closeMenu);
    document.querySelectorAll('.menu-links a').forEach(link =>
        link.addEventListener('click', closeMenu)
    );
}