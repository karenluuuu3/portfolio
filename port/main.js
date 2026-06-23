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
                        <img src="${proj.image}" alt="${proj.title}">
                    </div>
                    <div class="row-info">
                        <span class="row-category">${proj.categoryLabel}</span>
                        <h3 class="row-title">${proj.title}</h3>
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
    // 4. RENDER DETAIL PAGE (動態生成)
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

        // 更新頁面標題
        document.title = `${project.title} — Project Detail`;

        // 收集要渲染的 section
        const sections = [];

        // --- 01 HERO (永遠顯示) ---
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
            <div class="overview-meta-item">
                <span class="meta-key">YEAR</span>
                <span class="meta-val">${project.year}</span>
            </div>
            <div class="overview-meta-item">
                <span class="meta-key">CATEGORY</span>
                <span class="meta-val">${project.categoryLabel}</span>
            </div>
            <div class="overview-meta-item">
                <span class="meta-key">TOOLS</span>
                <span class="meta-val">${toolsStr}</span>
            </div>`;

        if (exhibitionName) {
            overviewMetaHTML += `
            <div class="overview-meta-item">
                <span class="meta-key">EXHIBITION</span>
                <span class="meta-val">${exhibitionName}</span>
            </div>`;
        }

        sections.push({
            id: 'detail-overview',
            navLabel: 'OVERVIEW',
            navSub: 'Project<br>Information',
            html: `
                <section class="detail-section detail-overview" id="detail-overview">
                    <div class="detail-section-header">
                        <h2 class="detail-section-title">Overview</h2>
                    </div>
                    <div class="detail-overview-grid">
                        <div class="detail-overview-desc">
                            <p>${project.desc}</p>
                        </div>
                        <div class="detail-overview-meta-grid">
                            ${overviewMetaHTML}
                        </div>
                    </div>
                </section>`
        });

        // --- CONTENT 區塊（有 content 陣列才顯示）---
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
                            <div class="detail-section-header">
                                <h2 class="detail-section-title">${block.heading}</h2>
                            </div>
                            <div class="detail-concept-body">
                                ${bodyHTML}
                            </div>
                        </section>`
                });
            });
        }

        // --- 03 EXHIBITION (有展覽資料才顯示) ---
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
                        <div class="detail-section-header">
                            <h2 class="detail-section-title">Exhibition</h2>
                        </div>
                        <h3 style="font-size:1.1rem; margin-bottom:24px; color:var(--text-muted);">${ex.name}</h3>
                        <div class="technical-specs-list">
                            ${exDetails}
                        </div>
                        ${exLink}
                    </section>`
            });
        }

        // --- 04 GALLERY ---
        const hasLayout = project.galleryLayout && project.galleryLayout.length > 0;
        const hasGallery = project.gallery && project.gallery.length > 0;

        if (hasLayout || hasGallery) {
            let galleryInnerHTML = '';

            if (hasLayout) {
                // ===== 舊專案：指定排版 =====
                let figCount = 0;
                galleryInnerHTML = project.galleryLayout.map(row => {
                    if (row.length === 1) {
                        figCount++;
                        return `
                            <div class="gallery-row gallery-row-full">
                                <div class="gallery-item-media">
                                    <img src="${row[0]}" alt="${project.title} — Fig.${String(figCount).padStart(2, '0')}">
                                </div>
                                <div class="gallery-item-caption">
                                    <span class="fig-label">Fig.${String(figCount).padStart(2, '0')}</span>
                                    <div class="fig-divider"></div>
                                </div>
                            </div>`;
                    } else {
                        figCount++;
                        const fig1 = figCount;
                        figCount++;
                        const fig2 = figCount;
                        return `
                            <div class="gallery-row gallery-row-pair">
                                <div class="gallery-pair-item">
                                    <div class="gallery-item-media">
                                        <img src="${row[0]}" alt="${project.title} — Fig.${String(fig1).padStart(2, '0')}">
                                    </div>
                                </div>
                                <div class="gallery-pair-item">
                                    <div class="gallery-item-media">
                                        <img src="${row[1]}" alt="${project.title} — Fig.${String(fig2).padStart(2, '0')}">
                                    </div>
                                </div>
                            </div>`;
                    }
                }).join('');
            } else {
                // ===== 新專案：自動 grid =====
                galleryInnerHTML = project.gallery.map((img, i) => `
                    <div class="gallery-item">
                        <div class="gallery-item-media">
                            <img src="${img}" alt="${project.title} — Fig.${String(i + 1).padStart(2, '0')}">
                        </div>
                        <div class="gallery-item-caption">
                            <span class="fig-label">Fig.${String(i + 1).padStart(2, '0')}</span>
                            <div class="fig-divider"></div>
                        </div>
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
                        <div class="detail-section-header">
                            <h2 class="detail-section-title">Gallery</h2>
                        </div>
                        <div class="${listClass}">
                            ${galleryInnerHTML}
                        </div>
                    </section>`
            });
        }

        // --- 05 LINKS / DOCUMENTATION (有 links 才顯示) ---
        if (project.links && Object.keys(project.links).length > 0) {
            const linkEntries = Object.entries(project.links);

            // 找 YouTube 影片做嵌入
            const ytEntry = linkEntries.find(([, url]) => url.includes('youtube.com/watch') || url.includes('youtu.be'));
            let videoEmbedHTML = '';
            if (ytEntry) {
                const ytId = extractYouTubeId(ytEntry[1]);
                if (ytId) {
                    videoEmbedHTML = `
                        <div class="doc-video-wrapper" style="margin-bottom:40px;">
                            <iframe
                                src="https://www.youtube.com/embed/${ytId}"
                                style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>`;
                }
            }

            // 其他連結列表
            const otherLinks = linkEntries.filter(([key, url]) => {
                if (ytEntry && url === ytEntry[1]) return false;
                return true;
            });
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
                        <div class="detail-section-header">
                            <h2 class="detail-section-title">Documentation</h2>
                        </div>
                        ${videoEmbedHTML}
                        ${linksListHTML}
                    </section>`
            });
        }

        // --- 06 CREDITS (有 credits 才顯示) ---
        if (project.credits && Object.keys(project.credits).length > 0) {
            const creditItems = Object.entries(project.credits).map(([role, name]) => `
                <div class="credit-item">
                    <span class="credit-role">${role.toUpperCase()}</span>
                    <span class="credit-name">${name}</span>
                </div>`
            ).join('');

            // 如果有 collaborators 也一起列出
            let collabHTML = '';
            if (project.collaborators && project.collaborators.length > 0) {
                collabHTML = `
                    <div class="credit-item" style="grid-column: 1 / -1; margin-top: 20px;">
                        <span class="credit-role">COLLABORATORS</span>
                        <span class="credit-name">${project.collaborators.join('、')}</span>
                    </div>`;
            }

            sections.push({
                id: 'detail-credits',
                navLabel: 'CREDITS',
                navSub: 'Team<br>&amp; Credits',
                html: `
                    <section class="detail-section detail-credits" id="detail-credits">
                        <div class="detail-section-header">
                            <h2 class="detail-section-title">Credits</h2>
                        </div>
                        <div class="credits-grid">
                            ${creditItems}
                            ${collabHTML}
                        </div>
                    </section>`
            });
        } else if (project.collaborators && project.collaborators.length > 0) {
            // 只有 collaborators 沒有 credits
            sections.push({
                id: 'detail-credits',
                navLabel: 'CREDITS',
                navSub: 'Team<br>&amp; Credits',
                html: `
                    <section class="detail-section detail-credits" id="detail-credits">
                        <div class="detail-section-header">
                            <h2 class="detail-section-title">Credits</h2>
                        </div>
                        <div class="credits-grid">
                            <div class="credit-item" style="grid-column: 1 / -1;">
                                <span class="credit-role">COLLABORATORS</span>
                                <span class="credit-name">${project.collaborators.join('、')}</span>
                            </div>
                        </div>
                    </section>`
            });
        }

        // --- NEXT PROJECT ---
        const currentIdx = projects.findIndex(p => p.id === projectId);
        const nextProject = projects[(currentIdx + 1) % projects.length];

        sections.push({
            id: null, // 不加進 side nav
            html: `
                <section class="detail-section detail-next-project">
                    <span class="next-project-label">NEXT PROJECT</span>
                    <h3 class="next-project-title">${nextProject.title}</h3>
                    <span class="next-project-year">${nextProject.year}</span>
                    <a href="project-detail.html?id=${nextProject.id}" class="next-project-link">VIEW PROJECT <span class="arrow">→</span></a>
                </section>`
        });

       

        // ========== 組裝 HTML ==========
        container.innerHTML = sections.map(s => s.html).join('');

        // ========== 組裝 Side Nav ==========
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
    }

    // YouTube ID 擷取
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
                    if (sortBy === 'latest') {
                        return parseInt(b.querySelector('.row-year').textContent) - parseInt(a.querySelector('.row-year').textContent);
                    }
                    if (sortBy === 'oldest') {
                        return parseInt(a.querySelector('.row-year').textContent) - parseInt(b.querySelector('.row-year').textContent);
                    }
                    if (sortBy === 'az') {
                        return a.querySelector('.row-title').textContent.trim().toLowerCase()
                            .localeCompare(b.querySelector('.row-title').textContent.trim().toLowerCase());
                    }
                    return 0;
                });

                rows.forEach(row => archiveList.appendChild(row));
                renumberVisibleRows();
            });
        });
    }


    // ==========================================
    // 7. DETAIL SCROLL SPY (動態初始化)
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
                        <li>
                            <span>${item.year}</span>
                            ${item.title}
                            <small>${item.detail}</small>
                        </li>
                    `).join('');

                    return `
                        <div class="matrix-block">
                            <h4>${block.heading}</h4>
                            <ul>${itemsHTML}</ul>
                        </div>
                    `;
                }).join('');
            })
            .catch(err => console.error('Error fetching about.json:', err));
    }

    // ==========================================
    // 9. PAGE TRANSITION — FADE OUT ON NAVIGATE
    // ==========================================
    function initPageTransitions() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            // 跳過：外部連結、新分頁、錨點、javascript、mailto
            if (!href) return;
            if (link.target === '_blank') return;
            if (href.startsWith('#')) return;
            if (href.startsWith('mailto:')) return;
            if (href.startsWith('javascript:')) return;
            if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

            e.preventDefault();
            document.body.classList.add('is-leaving');

            setTimeout(() => {
                window.location.href = href;
            }, 400); // 配合 fadeOut 動畫時間
        });
    }

    initPageTransitions();

    // ==========================================
    // 10. STICKY HEADER — SCROLL BACKGROUND
    // ==========================================
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            mainHeader.classList.toggle('is-scrolled', window.scrollY > 10);
        });
    }


    // ==========================================
    // 11. FLOATING BACK TO TOP BUTTON
    // ==========================================
    const floatingTopBtn = document.getElementById('floatingTopBtn');
    if (floatingTopBtn) {
        window.addEventListener('scroll', () => {
            floatingTopBtn.classList.toggle('is-visible', window.scrollY > 400);
        });

        floatingTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


});