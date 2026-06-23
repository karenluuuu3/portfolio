document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. FULLSCREEN OVERLAY MENU
    // ==========================================
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    function openMenu() {
        if (menuOverlay) {
            menuOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeMenu() {
        if (menuOverlay) {
            menuOverlay.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    document.querySelectorAll('.menu-links a').forEach(link => link.addEventListener('click', closeMenu));


    // ==========================================
    // 2. FETCH JSON & ROUTE
    // ==========================================
    fetch('projects.json')
        .then(r => r.json())
        .then(data => {
            const archiveList = document.querySelector('.archive-list');
            const detailMain = document.getElementById('detailMain');

            if (archiveList) renderArchive(data, archiveList);
            if (detailMain) renderDetail(data, detailMain);
        })
        .catch(err => console.error('Error fetching projects.json:', err));


    // ==========================================
    // 3. RENDER ARCHIVE
    // ==========================================
    function renderArchive(projects, container) {
        container.innerHTML = '';

        const sorted = [...projects].sort((a, b) => {
            return (parseFloat(b.date) || 0) - (parseFloat(a.date) || 0);
        });

        sorted.forEach(proj => {
            const searchTags = (proj.tags.join(' ') + ' ' + proj.title + ' ' + proj.year).toLowerCase();
            const tagsHTML = proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            const rowHTML = `
                <div class="archive-row" data-category="${proj.category}" data-group="${proj.group}" data-tags="${searchTags}">
                    <div class="row-index">
                        <span class="row-num"></span>
                        <span class="row-year">${proj.year}</span>
                    </div>
                    <div class="row-feature">
                        <a href="project-detail.html?id=${proj.id}" class="row-feature-link">
                            <img src="${proj.image}" alt="${proj.title}">
                        </a>
                    </div>
                    <div class="row-info">
                        <span class="row-category">${proj.categoryLabel}</span>
                        <h3 class="row-title"><a href="project-detail.html?id=${proj.id}">${proj.title}</a></h3>
                        <p class="row-desc">${proj.desc}</p>
                        <div class="row-tags">${tagsHTML}</div>
                        <a href="project-detail.html?id=${proj.id}" class="row-view">VIEW PROJECT <span class="arrow">→</span></a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', rowHTML);
        });

        renumberVisibleRows();
        initArchiveLogic(sorted.length);
        initSortLogic();
        initScrollRevealArchive();
    }


    // ==========================================
    // RENUMBER VISIBLE ROWS
    // ==========================================
    function renumberVisibleRows() {
        const rows = document.querySelectorAll('.archive-row');
        let count = 1;
        rows.forEach(row => {
            if (!row.classList.contains('is-hidden')) {
                row.querySelector('.row-num').textContent = String(count).padStart(2, '0');
                count++;
            }
        });
    }


    // ==========================================
    // 4. RENDER DETAIL PAGE
    // ==========================================
    function renderDetail(projects, container) {
        const urlParams = new URLSearchParams(window.location.search);
        let projectId = urlParams.get('id');
        if (!projectId) projectId = projects[0].id;

        const project = projects.find(p => p.id === projectId);
        if (!project) {
            container.innerHTML = '<section class="detail-section"><p>Project not found.</p></section>';
            return;
        }

        document.title = `${project.title} — Project Detail`;

        const sections = [];

        // --- 01 HERO ---
        const firstLink = project.links ? Object.values(project.links)[0] : null;
        const docLinkHTML = firstLink
            ? `<a href="${firstLink}" target="_blank" class="detail-doc-link">VIEW DOCUMENTATION <span class="arrow">→</span></a>`
            : '';

        sections.push({
            id: 'detail-hero',
            navLabel: 'HERO',
            navSub: 'Project<br>Introduction',
            html: `
                <section class="detail-section detail-hero" id="detail-hero">
                    <div class="detail-hero-grid">
                        <div class="detail-hero-text">
                            <a href="archive.html" class="detail-back-link">← BACK TO ARCHIVE</a>
                            <span class="detail-project-label">PROJECT ${project.id}</span>
                            <h1 class="detail-project-title">${project.title}</h1>
                            <div class="detail-hero-meta">
                                <span>${project.categoryLabel}</span>
                                <span>${project.year}</span>
                            </div>
                            <div class="detail-hero-divider"></div>
                            <p class="detail-hero-desc">${project.desc}</p>
                            ${docLinkHTML}
                        </div>
                        <div class="detail-hero-media">
                            <div class="detail-hero-media-inner">
                                <img src="${project.image}" alt="${project.title}">
                            </div>
                        </div>
                    </div>
                    <div class="detail-scroll-hint">SCROLL ↓</div>
                </section>`
        });

        // --- 02 OVERVIEW ---
        const toolsStr = project.tags ? project.tags.join('<br>') : '—';
        const exhibitionName = project.exhibition ? project.exhibition.name : null;

        let overviewMetaHTML = `
            <div class="overview-meta-item"><span class="meta-key">YEAR</span><span class="meta-val">${project.year}</span></div>
            <div class="overview-meta-item"><span class="meta-key">CATEGORY</span><span class="meta-val">${project.categoryLabel}</span></div>
            <div class="overview-meta-item"><span class="meta-key">TOOLS</span><span class="meta-val">${toolsStr}</span></div>`;
        if (exhibitionName) {
            overviewMetaHTML += `<div class="overview-meta-item"><span class="meta-key">EXHIBITION</span><span class="meta-val">${exhibitionName}</span></div>`;
        }

        sections.push({
            id: 'detail-overview',
            navLabel: 'OVERVIEW',
            navSub: 'Project<br>Information',
            html: `
                <section class="detail-section detail-overview" id="detail-overview">
                    <div class="detail-section-header"><h2 class="detail-section-title">Overview</h2></div>
                    <div class="detail-overview-grid">
                        <div class="detail-overview-desc"><p>${project.desc}</p></div>
                        <div class="detail-overview-meta-grid">${overviewMetaHTML}</div>
                    </div>
                </section>`
        });

        // --- CONTENT blocks ---
        if (project.content && project.content.length > 0) {
            project.content.forEach((block, i) => {
                const bodyHTML = block.body
                    .split('\n\n')
                    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
                    .join('');
                sections.push({
                    id: `detail-content-${i}`,
                    navLabel: block.heading.toUpperCase().slice(0, 12),
                    navSub: block.heading.replace(/(.{10}).+/, '$1…'),
                    html: `
                        <section class="detail-section" id="detail-content-${i}">
                            <div class="detail-section-header"><h2 class="detail-section-title">${block.heading}</h2></div>
                            <div class="detail-concept-body">${bodyHTML}</div>
                        </section>`
                });
            });
        }

        // --- EXHIBITION ---
        if (project.exhibition) {
            const ex = project.exhibition;
            let exDetails = '';
            if (ex.date) exDetails += `<div class="spec-row"><span class="spec-key">DATE</span><span class="spec-val">${ex.date}</span></div>`;
            if (ex.hours) exDetails += `<div class="spec-row"><span class="spec-key">HOURS</span><span class="spec-val">${ex.hours}</span></div>`;
            if (ex.location) exDetails += `<div class="spec-row"><span class="spec-key">LOCATION</span><span class="spec-val">${ex.location}</span></div>`;
            if (ex.event) exDetails += `<div class="spec-row"><span class="spec-key">EVENT</span><span class="spec-val">${ex.event}</span></div>`;
            const exLink = ex.url ? `<a href="${ex.url}" target="_blank" class="detail-doc-link" style="margin-top:24px;">EVENT WEBSITE <span class="arrow">→</span></a>` : '';

            sections.push({
                id: 'detail-exhibition',
                navLabel: 'EXHIBITION',
                navSub: 'Venue<br>&amp; Dates',
                html: `
                    <section class="detail-section" id="detail-exhibition">
                        <div class="detail-section-header"><h2 class="detail-section-title">Exhibition</h2></div>
                        <h3 style="font-size:1.1rem; margin-bottom:24px; color:var(--text-muted);">${ex.name}</h3>
                        <div class="technical-specs-list">${exDetails}</div>
                        ${exLink}
                    </section>`
            });
        }

        // --- GALLERY ---
        const hasLayout = project.galleryLayout && project.galleryLayout.length > 0;
        const hasGallery = project.gallery && project.gallery.length > 0;

        if (hasLayout || hasGallery) {
            let galleryInnerHTML = '';
            if (hasLayout) {
                let figCount = 0;
                galleryInnerHTML = project.galleryLayout.map(row => {
                    if (row.length === 1) {
                        figCount++;
                        return `
                            <div class="gallery-row-full">
                                <div class="gallery-item-media"><img src="${row[0]}" alt="${project.title} — Fig.${String(figCount).padStart(2, '0')}"></div>
                                <div class="gallery-item-caption"><span class="fig-label">Fig.${String(figCount).padStart(2, '0')}</span><div class="fig-divider"></div></div>
                            </div>`;
                    } else {
                        figCount++;
                        const fig1 = figCount;
                        figCount++;
                        const fig2 = figCount;
                        return `
                            <div class="gallery-row-pair">
                                <div class="gallery-pair-item"><div class="gallery-item-media"><img src="${row[0]}" alt="Fig.${String(fig1).padStart(2, '0')}"></div></div>
                                <div class="gallery-pair-item"><div class="gallery-item-media"><img src="${row[1]}" alt="Fig.${String(fig2).padStart(2, '0')}"></div></div>
                            </div>`;
                    }
                }).join('');
            } else {
                galleryInnerHTML = project.gallery.map((img, i) => `
                    <div class="gallery-item">
                        <div class="gallery-item-media"><img src="${img}" alt="${project.title} — Fig.${String(i + 1).padStart(2, '0')}"></div>
                        <div class="gallery-item-caption"><span class="fig-label">Fig.${String(i + 1).padStart(2, '0')}</span><div class="fig-divider"></div></div>
                    </div>`
                ).join('');
            }

            const listClass = hasLayout ? 'detail-gallery-list layout-mode' : 'detail-gallery-list grid-mode';

            sections.push({
                id: 'detail-gallery',
                navLabel: 'GALLERY',
                navSub: 'Installation<br>&amp; Details',
                html: `
                    <section class="detail-section detail-gallery" id="detail-gallery">
                        <div class="detail-section-header"><h2 class="detail-section-title">Gallery</h2></div>
                        <div class="${listClass}">${galleryInnerHTML}</div>
                    </section>`
            });
        }

        // --- LINKS / DOCUMENTATION ---
        if (project.links && Object.keys(project.links).length > 0) {
            const linkEntries = Object.entries(project.links);
            const ytEntry = linkEntries.find(([, url]) => url.includes('youtube.com/watch') || url.includes('youtu.be'));
            let videoEmbedHTML = '';
            if (ytEntry) {
                const ytId = extractYouTubeId(ytEntry[1]);
                if (ytId) {
                    videoEmbedHTML = `
                        <div class="doc-video-wrapper" style="margin-bottom:40px;">
                            <iframe src="https://www.youtube.com/embed/${ytId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>`;
                }
            }
            const otherLinks = linkEntries.filter(([key, url]) => !(ytEntry && url === ytEntry[1]));
            const linksListHTML = otherLinks.map(([key, url]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return `<a href="${url}" target="_blank" class="detail-doc-link" style="display:block; margin-bottom:12px;">${label} <span class="arrow">→</span></a>`;
            }).join('');

            sections.push({
                id: 'detail-documentation',
                navLabel: 'LINKS',
                navSub: 'Video<br>&amp; Links',
                html: `
                    <section class="detail-section detail-documentation" id="detail-documentation">
                        <div class="detail-section-header"><h2 class="detail-section-title">Documentation</h2></div>
                        ${videoEmbedHTML}
                        ${linksListHTML}
                    </section>`
            });
        }

        // --- CREDITS ---
        if (project.credits && Object.keys(project.credits).length > 0) {
            const creditItems = Object.entries(project.credits).map(([role, name]) => `
                <div class="credit-item"><span class="credit-role">${role.toUpperCase()}</span><span class="credit-name">${name}</span></div>`
            ).join('');
            let collabHTML = '';
            if (project.collaborators && project.collaborators.length > 0) {
                collabHTML = `<div class="credit-item" style="grid-column: 1 / -1; margin-top: 20px;"><span class="credit-role">COLLABORATORS</span><span class="credit-name">${project.collaborators.join('、')}</span></div>`;
            }
            sections.push({
                id: 'detail-credits',
                navLabel: 'CREDITS',
                navSub: 'Team<br>&amp; Credits',
                html: `
                    <section class="detail-section detail-credits" id="detail-credits">
                        <div class="detail-section-header"><h2 class="detail-section-title">Credits</h2></div>
                        <div class="credits-grid">${creditItems}${collabHTML}</div>
                    </section>`
            });
        } else if (project.collaborators && project.collaborators.length > 0) {
            sections.push({
                id: 'detail-credits',
                navLabel: 'CREDITS',
                navSub: 'Team<br>&amp; Credits',
                html: `
                    <section class="detail-section detail-credits" id="detail-credits">
                        <div class="detail-section-header"><h2 class="detail-section-title">Credits</h2></div>
                        <div class="credits-grid"><div class="credit-item" style="grid-column: 1 / -1;"><span class="credit-role">COLLABORATORS</span><span class="credit-name">${project.collaborators.join('、')}</span></div></div>
                    </section>`
            });
        }

        // --- NEXT PROJECT ---
        const currentIdx = projects.findIndex(p => p.id === projectId);
        const nextProject = projects[(currentIdx + 1) % projects.length];

        sections.push({
            id: null,
            html: `
                <section class="detail-section detail-next-project">
                    <span class="next-project-label">NEXT PROJECT</span>
                    <h3 class="next-project-title">${nextProject.title}</h3>
                    <span class="next-project-year">${nextProject.year}</span>
                    <a href="project-detail.html?id=${nextProject.id}" class="next-project-link">VIEW PROJECT <span class="arrow">→</span></a>
                </section>`
        });

        // ========== Assemble ==========
        container.innerHTML = sections.map(s => s.html).join('');

        // ========== Side Nav ==========
        const navTrack = document.getElementById('sideNavTrack');
        if (navTrack) {
            const navSections = sections.filter(s => s.id);
            navTrack.innerHTML = navSections.map((s, i) => `
                <a href="#${s.id}" class="side-nav-item${i === 0 ? ' active' : ''}" data-index="${String(i + 1).padStart(2, '0')}">
                    <span class="side-nav-num">${String(i + 1).padStart(2, '0')}</span>
                    <span class="side-nav-label">${s.navLabel}</span>
                    <span class="side-nav-sub">${s.navSub}</span>
                </a>
            `).join('');

            initDetailScrollSpy();
        }

        // Trigger detail animations
        initDetailAnimations();
    }

    function extractYouTubeId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/);
        return match ? match[1] : null;
    }


    // ==========================================
    // 5. ARCHIVE FILTER
    // ==========================================
    function initArchiveLogic(totalCount) {
        const searchInput = document.getElementById('archiveSearch');
        const filterTags = document.querySelectorAll('.filter-tag');
        const archiveRows = document.querySelectorAll('.archive-row');
        const showingCountEl = document.getElementById('showingCount');

        if (showingCountEl) showingCountEl.textContent = `SHOWING ${totalCount} PROJECTS`;

        let searchQuery = '';
        let activeCategory = 'all';

        function applyFilters() {
            let visibleCount = 0;
            archiveRows.forEach(row => {
                const rowGroup = row.getAttribute('data-group') || '';
                const rowTags = (row.getAttribute('data-tags') || '').toLowerCase();
                const matchesCategory = (activeCategory === 'all' || rowGroup === activeCategory);
                const matchesSearch = rowTags.includes(searchQuery);

                if (matchesCategory && matchesSearch) {
                    row.classList.remove('is-hidden');
                    visibleCount++;
                } else {
                    row.classList.add('is-hidden');
                }
            });
            if (showingCountEl) showingCountEl.textContent = `SHOWING ${visibleCount} PROJECTS`;
            renumberVisibleRows();
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                applyFilters();
            });
        }

        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                activeCategory = tag.getAttribute('data-filter');
                applyFilters();
            });
        });
    }


    // ==========================================
    // 6. ARCHIVE SORT
    // ==========================================
    function initSortLogic() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) return;

        const trigger = sortSelect.querySelector('.select-trigger');
        const valueLabel = sortSelect.querySelector('.select-value');
        const options = sortSelect.querySelectorAll('.select-option');
        const archiveList = document.querySelector('.archive-list');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            sortSelect.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', sortSelect.classList.contains('is-open'));
        });

        document.addEventListener('click', () => {
            sortSelect.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                options.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                valueLabel.textContent = option.textContent;
                sortSelect.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');

                const sortBy = option.getAttribute('data-value');
                const rows = [...document.querySelectorAll('.archive-row')];

                rows.sort((a, b) => {
                    if (sortBy === 'latest') return parseInt(b.querySelector('.row-year').textContent) - parseInt(a.querySelector('.row-year').textContent);
                    if (sortBy === 'oldest') return parseInt(a.querySelector('.row-year').textContent) - parseInt(b.querySelector('.row-year').textContent);
                    if (sortBy === 'az') return a.querySelector('.row-title').textContent.trim().toLowerCase().localeCompare(b.querySelector('.row-title').textContent.trim().toLowerCase());
                    return 0;
                });

                rows.forEach(row => archiveList.appendChild(row));
                renumberVisibleRows();
            });
        });
    }


    // ==========================================
    // 7. DETAIL SCROLL SPY
    // ==========================================
    function initDetailScrollSpy() {
        const sideNavItems = document.querySelectorAll('.side-nav-item');
        const detailSections = document.querySelectorAll('.detail-section[id]');

        if (sideNavItems.length === 0 || detailSections.length === 0) return;

        sideNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(item.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    sideNavItems.forEach(nav => {
                        nav.classList.toggle('active', nav.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

        detailSections.forEach(section => observer.observe(section));
    }


    // ==========================================
    // 8. RENDER ABOUT PAGE RESUME GRID
    // ==========================================
    const resumeGrid = document.getElementById('resumeGrid');
    if (resumeGrid) {
        fetch('about.json')
            .then(r => r.json())
            .then(data => {
                resumeGrid.innerHTML = data.resume.map(block => {
                    const itemsHTML = block.items.map(item => `
                        <li><span>${item.year}</span>${item.title}<small>${item.detail}</small></li>
                    `).join('');
                    return `<div class="matrix-block"><h4>${block.heading}</h4><ul>${itemsHTML}</ul></div>`;
                }).join('');

                // Reveal matrix blocks
                initScrollRevealGeneric('.matrix-block');
            })
            .catch(err => console.error('Error fetching about.json:', err));
    }

    // About page columns reveal
    initScrollRevealGeneric('.about-text-column');
    initScrollRevealGeneric('.about-visual-column');


    // ==========================================
    // 9. PAGE TRANSITION — OVERLAY WIPE
    // ==========================================
    function initPageTransitions() {
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

    initPageTransitions();


    // ==========================================
    // 10. STICKY HEADER
    // ==========================================
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            mainHeader.classList.toggle('is-scrolled', window.scrollY > 10);
        }, { passive: true });
    }


    // ==========================================
    // 11. FLOATING BACK TO TOP
    // ==========================================
    const floatingTopBtn = document.getElementById('floatingTopBtn');
    if (floatingTopBtn) {
        window.addEventListener('scroll', () => {
            floatingTopBtn.classList.toggle('is-visible', window.scrollY > 400);
        }, { passive: true });

        floatingTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==========================================
    // 12. CUSTOM CURSOR
    // ==========================================
    const cursor = document.getElementById('customCursor');
    const ring = document.getElementById('cursorRing');

    if (cursor && ring && window.matchMedia('(pointer: fine)').matches) {
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


    // ==========================================
    // 13. HERO TITLE LINE-BY-LINE WRAP
    // ==========================================
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const html = heroTitle.innerHTML;
        // Split by <br> to get each line, wrap each in clip container
        const lines = html.split(/<br\s*\/?>/i);
        heroTitle.innerHTML = lines.map(line =>
            `<span class="line-wrap"><span class="line-inner">${line.trim()}</span></span>`
        ).join('');
    }


    // ==========================================
    // 14. HERO PARALLAX ON SCROLL
    // ==========================================
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const speed = 0.35;
            heroBg.style.transform = `scale(1.1) translateY(${scrollY * speed}px)`;
        }, { passive: true });
    }


    // ==========================================
    // 15. SCROLL REVEAL — ARCHIVE ROWS (staggered)
    // ==========================================
    function initScrollRevealArchive() {
        const rows = document.querySelectorAll('.archive-row');
        if (rows.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger based on visible position
                    const row = entry.target;
                    const visibleRows = [...document.querySelectorAll('.archive-row:not(.is-hidden):not(.is-visible)')];
                    const idx = visibleRows.indexOf(row);
                    const delay = Math.max(0, idx) * 80;

                    setTimeout(() => {
                        row.classList.add('is-visible');
                    }, delay);

                    observer.unobserve(row);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

        rows.forEach(row => observer.observe(row));
    }


    // ==========================================
    // 16. SCROLL REVEAL — GENERIC ELEMENTS
    // ==========================================
    function initScrollRevealGeneric(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        const stagger = options.stagger || 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = stagger * i;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

        elements.forEach(el => observer.observe(el));
    }


    // ==========================================
    // 17. DETAIL PAGE — ANIMATION INIT
    // ==========================================
    function initDetailAnimations() {
        // Hero cascade trigger
        const detailHero = document.querySelector('.detail-hero');
        if (detailHero) {
            setTimeout(() => {
                detailHero.classList.add('is-animated');
            }, 200);
        }

        // Gallery items stagger reveal
        const galleryItems = document.querySelectorAll('.gallery-item, .gallery-row-full, .gallery-row-pair');
        if (galleryItems.length > 0) {
            const galleryObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        galleryObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

            galleryItems.forEach((item, i) => {
                item.style.transitionDelay = `${(i % 4) * 100}ms`;
                galleryObserver.observe(item);
            });
        }

        // Generic detail sections reveal
        const detailSections = document.querySelectorAll('.detail-section:not(.detail-hero)');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

        detailSections.forEach(section => sectionObserver.observe(section));

        // Image parallax in detail
        initDetailImageParallax();
    }


    // ==========================================
    // 18. DETAIL IMAGE PARALLAX
    // ==========================================
    function initDetailImageParallax() {
        const images = document.querySelectorAll('.gallery-item-media img, .detail-hero-media-inner img');
        if (images.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target._inView = true;
                } else {
                    entry.target._inView = false;
                }
            });
        }, { threshold: 0 });

        images.forEach(img => {
            img._inView = false;
            observer.observe(img);
        });

        window.addEventListener('scroll', () => {
            images.forEach(img => {
                if (!img._inView) return;
                const rect = img.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const viewCenter = window.innerHeight / 2;
                const offset = (center - viewCenter) * 0.04;
                img.style.transform = `translateY(${offset}px)`;
            });
        }, { passive: true });
    }


    // ==========================================
    // 19. ARCHIVE IMAGE TILT ON HOVER
    // ==========================================
    document.addEventListener('mousemove', (e) => {
        const feature = e.target.closest('.row-feature');
        if (!feature) return;

        const rect = feature.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const img = feature.querySelector('img');
        if (img) {
            img.style.transform = `scale(1.04) translate(${x * 8}px, ${y * 8}px)`;
        }
    });

    document.addEventListener('mouseout', (e) => {
        const feature = e.target.closest('.row-feature');
        if (feature) {
            const img = feature.querySelector('img');
            if (img) img.style.transform = '';
        }
    });

});