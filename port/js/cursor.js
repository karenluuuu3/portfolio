export function initCursor() {
    const cursor = document.getElementById('customCursor');
    const ring = document.getElementById('cursorRing');

    if (!cursor || !ring || !window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = 'a, button, .filter-tag, .row-view, .menu-toggle, .menu-close-btn, .select-trigger, .select-option, .floating-top-btn, .row-feature';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.add('is-hovering');
            ring.classList.add('is-hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.remove('is-hovering');
            ring.classList.remove('is-hovering');
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
    });
}