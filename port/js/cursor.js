export function initCursor() {
    const cursor = document.getElementById('customCursor');
    const ring = document.getElementById('cursorRing');

    if (!cursor || !ring || !window.matchMedia('(pointer: fine)').matches) return;

    document.documentElement.classList.add('custom-cursor-ready');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId = null;
    let idleTimer = null;

    function startLoop() {
        if (rafId) return; // 已經在跑了
        animateRing();
    }

    function stopLoop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        // 當 ring 已經追上 cursor（差距 < 0.5px），停止 loop
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            ring.style.left = mouseX + 'px';
            ring.style.top = mouseY + 'px';
            ringX = mouseX;
            ringY = mouseY;
            rafId = null; // 停止
            return;
        }

        rafId = requestAnimationFrame(animateRing);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        startLoop(); // 滑鼠移動時確保 loop 在跑
    });

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
        stopLoop();
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
        startLoop();
    });
}