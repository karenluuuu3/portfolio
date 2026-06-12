document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. FULLSCREEN OVERLAY MENU LOGIC
    // ==========================================
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    function openMenu() {
        if (menuOverlay) {
            menuOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }
    }

    function closeMenu() {
        if (menuOverlay) {
            menuOverlay.classList.remove('is-open');
            document.body.style.overflow = ''; // Restore background scroll
        }
    }

    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

    // Close menu gracefully when clicking any overlay links
    const menuLinks = document.querySelectorAll('.menu-links a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });


    // ==========================================
    // 2. PROJECT DETAIL SIDEBAR STEP NAVIGATION (SAFEGUARDED)
    // ==========================================
    const stepNodes = document.querySelectorAll('.media-nav-dots .step-node');
    const mainShowcaseMedia = document.querySelector('.main-showcase-media');
    const stripItems = document.querySelectorAll('.media-filmstrip .strip-item');

    const projectStepsData = {
        'INTRO': {
            image: 'images/work/13.png',
            alt: 'Echo-me main visual scene'
        },
        'CONCEPT': {
            image: 'images/work/11.jpg',
            alt: 'Exhibition hardware projection mapping breakdown'
        },
        'TECHNICAL': {
            image: 'images/work/10.png',
            alt: 'Generative particle development process'
        },
        'PROCESS': {
            image: 'images/work/bg.png',
            alt: 'Additional process installation'
        }
    };

    function updateShowcaseMedia(stepKey) {
        const data = projectStepsData[stepKey.toUpperCase()];
        if (!data || !mainShowcaseMedia) return;

        const imgElement = mainShowcaseMedia.querySelector('img');
        if (imgElement) {
            imgElement.src = data.image;
            imgElement.alt = data.alt;
        }
    }

    // Only configure event listeners if navigation steps exist on current DOM
    if (stepNodes.length > 0) {
        stepNodes.forEach(node => {
            node.addEventListener('click', () => {
                stepNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');

                const stepValue = node.getAttribute('data-step');
                if (stepValue) updateShowcaseMedia(stepValue);

                if (stripItems.length > 0) {
                    stripItems.forEach(item => item.classList.remove('active'));
                    const targetIndex = Array.from(stepNodes).indexOf(node);
                    if (stripItems[targetIndex]) {
                        stripItems[targetIndex].classList.add('active');
                    }
                }
            });
        });
    }

    if (stripItems.length > 0) {
        stripItems.forEach((item, index) => {
            if (item.classList.contains('asset-count-card')) return;
            
            item.addEventListener('click', () => {
                stripItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                if (stepNodes[index]) {
                    stepNodes.forEach(n => n.classList.remove('active'));
                    stepNodes[index].classList.add('active');
                    const stepValue = stepNodes[index].getAttribute('data-step');
                    if (stepValue) updateShowcaseMedia(stepValue);
                }
            });
        });
    }


    // ==========================================
    // 3. ARCHIVE GRID FILTER ENGINE (SAFEGUARDED)
    // ==========================================
    const searchInput = document.getElementById('archiveSearch');
    const filterTags = document.querySelectorAll('.filter-tag');
    const archiveRows = document.querySelectorAll('.archive-row');

    let searchQuery = '';
    let activeCategory = 'all';

    function filterArchiveGrid() {
        archiveRows.forEach(row => {
            const rowCategory = row.getAttribute('data-category') || '';
            const rowTags = (row.getAttribute('data-tags') || '').toLowerCase();

            const matchesCategory = (activeCategory === 'all' || rowCategory === activeCategory);
            const matchesSearch = rowTags.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                row.classList.remove('is-hidden');
            } else {
                row.classList.add('is-hidden');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterArchiveGrid();
        });
    }

    if (filterTags.length > 0) {
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');

                activeCategory = tag.getAttribute('data-filter');
                filterArchiveGrid();
            });
        });
    }

  
});