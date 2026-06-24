export function initDetailPage() {
    const detailMain = document.getElementById('detailMain');
    if (!detailMain) return;

    fetch('projects.json')
        .then(r => r.json())
        .then(data => renderDetail(data, detailMain))
        .catch(err => console.error('Error fetching projects.json:', err));
}

function renderDetail(projects, container) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || projects[0].id;
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        container.innerHTML = '<section class="detail-section"><p>Project not found.</p></section>';
        return;
    }

    document.title = `${project.title} — Project Detail`;

    // 每個 section 各自一個 builder 函式
    const sections = [
        buildHeroSection(project),
        buildOverviewSection(project),
        ...buildContentSections(project),
        buildExhibitionSection(project),
        buildGallerySection(project),
        buildLinksSection(project),
        buildCreditsSection(project),
        buildNextProjectSection(projects, projectId),
    ].filter(Boolean); // 過濾掉 null（某些 section 可能不存在）

    container.innerHTML = sections.map(s => s.html).join('');

    initSideNav(sections.filter(s => s.id));
    initDetailAnimations();
}

// ---------- Section Builders ----------

function buildHeroSection(project) {
    const firstLink = project.links ? Object.values(project.links)[0] : null;
    const docLinkHTML = firstLink
        ? `<a href="${firstLink}" target="_blank" class="detail-doc-link">VIEW DOCUMENTATION <span class="arrow">→</span></a>`
        : '';

    return {
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
                            <img src="${project.image}" alt="${project.title}" loading="lazy">
                        </div>
                    </div>
                </div>
                <div class="detail-scroll-hint">SCROLL ↓</div>
            </section>`
    };
}

function buildOverviewSection(project) {
    const toolsStr = project.tags ? project.tags.join('<br>') : '—';
    const exhibitionName = project.exhibition?.name;

    let metaHTML = `
        <div class="overview-meta-item"><span class="meta-key">YEAR</span><span class="meta-val">${project.year}</span></div>
        <div class="overview-meta-item"><span class="meta-key">CATEGORY</span><span class="meta-val">${project.categoryLabel}</span></div>
        <div class="overview-meta-item"><span class="meta-key">TOOLS</span><span class="meta-val">${toolsStr}</span></div>`;
    if (exhibitionName) {
        metaHTML += `<div class="overview-meta-item"><span class="meta-key">EXHIBITION</span><span class="meta-val">${exhibitionName}</span></div>`;
    }

    return {
        id: 'detail-overview',
        navLabel: 'OVERVIEW',
        navSub: 'Project<br>Information',
        html: `
            <section class="detail-section detail-overview" id="detail-overview">
                <div class="detail-section-header"><h2 class="detail-section-title">Overview</h2></div>
                <div class="detail-overview-grid">
                    <div class="detail-overview-desc"><p>${project.desc}</p></div>
                    <div class="detail-overview-meta-grid">${metaHTML}</div>
                </div>
            </section>`
    };
}

function buildContentSections(project) {
    if (!project.content?.length) return [];
    return project.content.map((block, i) => {
        const bodyHTML = block.body
            .split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
        return {
            id: `detail-content-${i}`,
            navLabel: block.heading.toUpperCase().slice(0, 12),
            navSub: block.heading.replace(/(.{10}).+/, '$1…'),
            html: `
                <section class="detail-section" id="detail-content-${i}">
                    <div class="detail-section-header"><h2 class="detail-section-title">${block.heading}</h2></div>
                    <div class="detail-concept-body">${bodyHTML}</div>
                </section>`
        };
    });
}

function buildExhibitionSection(project) {
    if (!project.exhibition) return null;
    const ex = project.exhibition;
    let details = '';
    if (ex.date) details += `<div class="spec-row"><span class="spec-key">DATE</span><span class="spec-val">${ex.date}</span></div>`;
    if (ex.hours) details += `<div class="spec-row"><span class="spec-key">HOURS</span><span class="spec-val">${ex.hours}</span></div>`;
    if (ex.location) details += `<div class="spec-row"><span class="spec-key">LOCATION</span><span class="spec-val">${ex.location}</span></div>`;
    if (ex.event) details += `<div class="spec-row"><span class="spec-key">EVENT</span><span class="spec-val">${ex.event}</span></div>`;
    const exLink = ex.url ? `<a href="${ex.url}" target="_blank" class="detail-doc-link" style="margin-top:24px;">EVENT WEBSITE <span class="arrow">→</span></a>` : '';

    return {
        id: 'detail-exhibition',
        navLabel: 'EXHIBITION',
        navSub: 'Venue<br>&amp; Dates',
        html: `
            <section class="detail-section" id="detail-exhibition">
                <div class="detail-section-header"><h2 class="detail-section-title">Exhibition</h2></div>
                <h3 style="font-size:1.1rem; margin-bottom:24px; color:var(--text-muted);">${ex.name}</h3>
                <div class="technical-specs-list">${details}</div>
                ${exLink}
            </section>`
    };
}

function buildGallerySection(project) {
    // ... 同理把原本的 gallery 邏輯搬進來
    // 回傳 { id, navLabel, navSub, html } 或 null
    if (!project.galleryLayout?.length && !project.gallery?.length) return null;
    // （實作省略，結構同原本）
    return { id: 'detail-gallery', navLabel: 'GALLERY', navSub: 'Installation<br>&amp; Details', html: '...' };
}

function buildLinksSection(project) {
    if (!project.links || Object.keys(project.links).length === 0) return null;
    // （實作省略，結構同原本）
    return { id: 'detail-documentation', navLabel: 'LINKS', navSub: 'Video<br>&amp; Links', html: '...' };
}

function buildCreditsSection(project) {
    if (!project.credits && !project.collaborators?.length) return null;
    // （實作省略）
    return { id: 'detail-credits', navLabel: 'CREDITS', navSub: 'Team<br>&amp; Credits', html: '...' };
}

function buildNextProjectSection(projects, currentId) {
    const idx = projects.findIndex(p => p.id === currentId);
    const next = projects[(idx + 1) % projects.length];
    return {
        id: null,
        html: `
            <section class="detail-section detail-next-project">
                <span class="next-project-label">NEXT PROJECT</span>
                <h3 class="next-project-title">${next.title}</h3>
                <span class="next-project-year">${next.year}</span>
                <a href="project-detail.html?id=${next.id}" class="next-project-link">VIEW PROJECT <span class="arrow">→</span></a>
            </section>`
    };
}

// ---------- Side Nav & Animations ----------
function initSideNav(sections) { /* 同原本 scrollspy 邏輯 */ }
function initDetailAnimations() { /* 同原本 */ }