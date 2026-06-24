export function initArchivePage() {
    const archiveList = document.querySelector('.archive-list');
    if (!archiveList) return;

    fetch('projects.json')
        .then(r => r.json())
        .then(data => renderArchive(data, archiveList))
        .catch(err => console.error('Error fetching projects.json:', err));
}

function renderArchive(projects, container) {
    container.innerHTML = '';

    const sorted = [...projects].sort((a, b) =>
        (parseFloat(b.date) || 0) - (parseFloat(a.date) || 0)
    );

    sorted.forEach(proj => {
        const searchTags = (proj.tags.join(' ') + ' ' + proj.title + ' ' + proj.year).toLowerCase();
        const tagsHTML = proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        container.insertAdjacentHTML('beforeend', `
            <div class="archive-row" data-category="${proj.category}" data-group="${proj.group}" data-tags="${searchTags}">
                <div class="row-index">
                    <span class="row-num"></span>
                    <span class="row-year">${proj.year}</span>
                </div>
                <div class="row-feature">
                    <a href="project-detail.html?id=${proj.id}" class="row-feature-link">
                        <img src="${proj.image}" alt="${proj.title}" loading="lazy">
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
        `);
    });

    renumberVisibleRows();
    initFilters(sorted.length);
    initSort();
    initArchiveScrollReveal();
    initImageTilt();
}

// ---- 以下是 filter / sort / renumber 等輔助函式 ----

function renumberVisibleRows() {
    let count = 1;
    document.querySelectorAll('.archive-row').forEach(row => {
        if (!row.classList.contains('is-hidden')) {
            row.querySelector('.row-num').textContent = String(count).padStart(2, '0');
            count++;
        }
    });
}

function initFilters(totalCount) {
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

            row.classList.toggle('is-hidden', !(matchesCategory && matchesSearch));
            if (matchesCategory && matchesSearch) visibleCount++;
        });
        if (showingCountEl) showingCountEl.textContent = `SHOWING ${visibleCount} PROJECTS`;
        renumberVisibleRows();
    }

    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeCategory = tag.getAttribute('data-filter');
            applyFilters();
        });
    });
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    const trigger = sortSelect.querySelector('.select-trigger');
    const valueLabel = sortSelect.querySelector('.select-value');
    const options = sortSelect.querySelectorAll('.select-option');
    const archiveList = document.querySelector('.archive-list');

    function openDropdown() {
        sortSelect.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        // 聚焦到目前 active 的選項
        const active = sortSelect.querySelector('.select-option.active');
        active?.focus();
    }

    function closeDropdown() {
        sortSelect.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
    }

    function selectOption(option) {
        options.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        valueLabel.textContent = option.textContent;
        closeDropdown();
        applySorting(option.getAttribute('data-value'), archiveList);
    }

    // 開關 dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sortSelect.classList.contains('is-open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    // trigger 上的鍵盤：Enter/Space 開啟, ArrowDown 開啟並聚焦第一個
    trigger.addEventListener('keydown', (e) => {
        if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            openDropdown();
        }
    });

    // 選項的點擊
    options.forEach(option => {
        // 讓每個 option 可以被 focus
        option.setAttribute('tabindex', '-1');

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectOption(option);
        });

        // 選項上的鍵盤導航
        option.addEventListener('keydown', (e) => {
            const optionArr = [...options];
            const currentIdx = optionArr.indexOf(option);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    optionArr[(currentIdx + 1) % optionArr.length]?.focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    optionArr[(currentIdx - 1 + optionArr.length) % optionArr.length]?.focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    selectOption(option);
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeDropdown();
                    break;
                case 'Tab':
                    closeDropdown();
                    break;
            }
        });
    });

    // 點擊外部關閉
    document.addEventListener('click', () => {
        if (sortSelect.classList.contains('is-open')) {
            closeDropdown();
        }
    });
}

function applySorting(sortBy, archiveList) {
    const rows = [...document.querySelectorAll('.archive-row')];

    rows.sort((a, b) => {
        const yearA = parseInt(a.querySelector('.row-year').textContent);
        const yearB = parseInt(b.querySelector('.row-year').textContent);
        const titleA = a.querySelector('.row-title').textContent.trim();
        const titleB = b.querySelector('.row-title').textContent.trim();

        if (sortBy === 'latest') {
            return yearB - yearA || titleA.localeCompare(titleB);
        }
        if (sortBy === 'oldest') {
            return yearA - yearB || titleA.localeCompare(titleB);
        }
        if (sortBy === 'az') {
            return titleA.localeCompare(titleB);
        }
        return 0;
    });

    const fragment = document.createDocumentFragment();
    rows.forEach(row => fragment.appendChild(row));
    archiveList.appendChild(fragment);

    renumberVisibleRows();
}

function initArchiveScrollReveal() {
    const rows = document.querySelectorAll('.archive-row');
    if (rows.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        visible.forEach((entry, i) => {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    rows.forEach(row => observer.observe(row));
}

function initImageTilt() {
    document.addEventListener('mousemove', (e) => {
        const feature = e.target.closest('.row-feature');
        if (!feature) return;
        const rect = feature.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const img = feature.querySelector('img');
        if (img) img.style.transform = `scale(1.04) translate(${x * 8}px, ${y * 8}px)`;
    });

    document.addEventListener('mouseout', (e) => {
        const feature = e.target.closest('.row-feature');
        if (feature) {
            const img = feature.querySelector('img');
            if (img) img.style.transform = '';
        }
    });
}