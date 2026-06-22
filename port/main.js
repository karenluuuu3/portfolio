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

    // ==========================================
    // 4. CUSTOM SORT DROPDOWN + SORT ENGINE
    // ==========================================
    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) {
        const trigger = sortSelect.querySelector('.select-trigger');
        const valueLabel = sortSelect.querySelector('.select-value');
        const options = sortSelect.querySelectorAll('.select-option');
        const archiveList = document.querySelector('.archive-list');
        const rows = () => [...document.querySelectorAll('.archive-row')];

        // Toggle open/close
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            sortSelect.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', sortSelect.classList.contains('is-open'));
        });

        // Close on outside click
        document.addEventListener('click', () => {
            sortSelect.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                sortSelect.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Option selection + sorting
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                // Update active state
                options.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                valueLabel.textContent = option.textContent;

                // Close dropdown
                sortSelect.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');

                // Sort rows
                const sortBy = option.getAttribute('data-value');
                const sorted = rows();

                sorted.sort((a, b) => {
                    if (sortBy === 'latest') {
                        const yA = parseInt(a.querySelector('.row-year').textContent);
                        const yB = parseInt(b.querySelector('.row-year').textContent);
                        return yB - yA || a.querySelector('.row-num').textContent.localeCompare(b.querySelector('.row-num').textContent);
                    }
                    if (sortBy === 'oldest') {
                        const yA = parseInt(a.querySelector('.row-year').textContent);
                        const yB = parseInt(b.querySelector('.row-year').textContent);
                        return yA - yB || a.querySelector('.row-num').textContent.localeCompare(b.querySelector('.row-num').textContent);
                    }
                    if (sortBy === 'az') {
                        const nA = a.querySelector('.row-title').textContent.trim().toLowerCase();
                        const nB = b.querySelector('.row-title').textContent.trim().toLowerCase();
                        return nA.localeCompare(nB);
                    }
                    return 0;
                });

                // Re-append in new order
                sorted.forEach(row => archiveList.appendChild(row));
            });
        });
    }

    // ==========================================
    // 5. DETAIL SIDE NAV — SCROLL SPY
    // ==========================================
    const sideNavItems = document.querySelectorAll('.side-nav-item');
    const detailSections = document.querySelectorAll('.detail-section[id]');

    if (sideNavItems.length > 0 && detailSections.length > 0) {
        // Smooth scroll on click
        sideNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Scroll spy — highlight active section
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    sideNavItems.forEach(nav => {
                        nav.classList.remove('active');
                        if (nav.getAttribute('href') === '#' + id) {
                            nav.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        detailSections.forEach(section => observer.observe(section));
    }





  
});