/**
 * 載入共用 HTML 元件（header + menu overlay、footer）
 */
export async function loadComponents() {
    const headerSlot = document.getElementById('header-slot');
    const footerSlots = document.querySelectorAll('.footer-slot');

    const [headerHTML, footerHTML] = await Promise.all([
        fetch('components/header.html').then(r => r.text()),
        fetch('components/footer.html').then(r => r.text()),
    ]);

    // 注入 header（cursor、transition overlay、menu overlay、header bar）
    if (headerSlot) {
        headerSlot.outerHTML = headerHTML;
    }

    // 注入 footer，並根據 slot 的 class 傳遞修飾 class
    footerSlots.forEach(slot => {
        const temp = document.createElement('div');
        temp.innerHTML = footerHTML.trim();
        const footer = temp.firstElementChild;

        // 如果 slot 帶有 footer-slot--detail，在 footer 上加對應 class
        if (slot.classList.contains('footer-slot--detail')) {
            footer.classList.add('site-footer--detail');
        }

        slot.replaceWith(footer);
    });
}