import { initScrollReveal } from './scrollReveal.js';

export function initAboutPage() {
    const resumeGrid = document.getElementById('resumeGrid');
    if (!resumeGrid) return;

    fetch('about.json')
        .then(r => r.json())
        .then(data => {
            resumeGrid.innerHTML = data.resume.map(block => {
                const itemsHTML = block.items.map(item => `
                    <li><span>${item.year}</span>${item.title}<small>${item.detail}</small></li>
                `).join('');
                return `<div class="matrix-block"><h4>${block.heading}</h4><ul>${itemsHTML}</ul></div>`;
            }).join('');

            initScrollReveal('.matrix-block');
        })
        .catch(err => console.error('Error fetching about.json:', err));

    initScrollReveal('.about-text-column');
    initScrollReveal('.about-visual-column');
    initProfileTilt();
}

function initProfileTilt() {
    const frame = document.querySelector('.profile-frame');
    if (!frame) return;

    const img = frame.querySelector('img');
    if (!img) return;

    frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        img.style.transform = `
            scale(1.03)
            rotateY(${x * 10}deg)
            rotateX(${-y * 10}deg)
        `;
        img.style.filter = 'grayscale(0) contrast(1)';
    });

    frame.addEventListener('mouseleave', () => {
        img.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), filter 0.6s ease';
        img.style.transform = '';
        img.style.filter = '';
        setTimeout(() => { img.style.transition = ''; }, 600);
    });
}