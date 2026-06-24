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
}