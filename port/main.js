document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. FULLSCREEN OVERLAY MENU LOGIC (保留不變)
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

    const menuLinks = document.querySelectorAll('.menu-links a');
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));


    // ==========================================
    // 2. FETCH JSON DATA & DYNAMIC ROUTING
    // ==========================================
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            const archiveList = document.querySelector('.archive-list');
            const detailMain = document.querySelector('.detail-main');

            // 如果在 Archive 頁面
            if (archiveList) {
                renderArchive(data, archiveList);
            }

            // 如果在 Project Detail 頁面
            if (detailMain) {
                renderDetail(data);
            }
        })
        .catch(error => console.error('Error fetching projects.json:', error));


    // ==========================================
    // 3. RENDER ARCHIVE PAGE
    // ==========================================
    function renderArchive(projects, container) {
        container.innerHTML = '';

        // 預設依日期由新到舊排序
        const sorted = [...projects].sort((a, b) => {
            const dateA = parseFloat(a.date) || 0;
            const dateB = parseFloat(b.date) || 0;
            return dateB - dateA;
        });

        sorted.forEach(proj => {
            const searchTags = (proj.tags.join(' ') + ' ' + proj.title + ' ' + proj.year).toLowerCase();
            const tagsHTML = proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            const rowHTML = `
                <div class="archive-row" data-category="${proj.category}" data-group="${proj.group}" data-tags="${searchTags}">
                    <div class="row-index">
                        <span class="row-num">${proj.id}</span>
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

        initArchiveLogic(sorted.length);
        initSortLogic();
    }


    // ==========================================
    // 4. RENDER DETAIL PAGE
    // ==========================================
    function renderDetail(projects) {
        // 從網址取得參數，例如 project-detail.html?id=01
        const urlParams = new URLSearchParams(window.location.search);
        let projectId = urlParams.get('id');
        
        // 如果沒有帶 ID，預設顯示第一筆資料
        if (!projectId) {
            projectId = projects[0].id; 
        }

        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        // 更新 Hero 區塊的文字與圖片
        document.querySelector('.detail-project-label').textContent = `PROJECT ${project.id}`;
        document.querySelector('.detail-project-title').textContent = project.title;
        document.querySelector('.detail-hero-desc').textContent = project.desc;
        
        const metaSpans = document.querySelectorAll('.detail-hero-meta span');
        if (metaSpans.length >= 2) metaSpans[1].textContent = project.year; // 更新年份
        
        const heroImg = document.querySelector('.detail-hero-media-inner img');
        if (heroImg) {
            heroImg.src = project.image;
            heroImg.alt = project.title;
        }

        // 註：若你的 JSON 之後增加了 Gallery 或 Overview 的詳細內容，也可以在這裡繼續對應替換
    }


    // ==========================================
    // 5. ARCHIVE GRID FILTER ENGINE
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

            if (showingCountEl) {
                showingCountEl.textContent = `SHOWING ${visibleCount} PROJECTS`;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                applyFilters();
            });
        }

        if (filterTags.length > 0) {
            filterTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    filterTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');

                    activeCategory = tag.getAttribute('data-filter');
                    applyFilters();
                });
            });
        }
    }


    // ==========================================
    // 6. CUSTOM SORT DROPDOWN + SORT ENGINE
    // ==========================================
    function initSortLogic() {
        const sortSelect = document.getElementById('sortSelect');

        if (sortSelect) {
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

                    rows.forEach(row => archiveList.appendChild(row));
                });
            });
        }
    }

    // ==========================================
    // 7. DETAIL SIDE NAV — SCROLL SPY
    // ==========================================
    const sideNavItems = document.querySelectorAll('.side-nav-item');
    const detailSections = document.querySelectorAll('.detail-section[id]');

    if (sideNavItems.length > 0 && detailSections.length > 0) {
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