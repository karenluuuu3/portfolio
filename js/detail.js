export function initDetailPage() {
    const detailMain = document.getElementById('detailMain');
    if (!detailMain) return;

    // 先顯示 skeleton
    detailMain.innerHTML = `
        <section class="detail-section detail-hero" style="min-height:80vh;">
            <div class="detail-hero-grid">
                <div>
                    <div class="skeleton-pulse skeleton-block" style="width:120px; height:14px; margin-bottom:20px;"></div>
                    <div class="skeleton-pulse" style="width:70%; height:48px; margin-bottom:16px;"></div>
                    <div class="skeleton-pulse skeleton-block--wide"></div>
                    <div class="skeleton-pulse skeleton-block--wide" style="margin-top:8px;"></div>
                </div>
                <div class="skeleton-pulse skeleton-block--img"></div>
            </div>
        </section>`;

    fetch('projects.json')
        .then(r => r.json())
        .then(data => renderDetail(data, detailMain))
        .catch(err => console.error('Error fetching projects.json:', err));
}


function externalLink(href, text, extraClass = '') {
    const cls = extraClass ? ` class="${extraClass}"` : '';
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"${cls}>${text}</a>`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
            ticking = false;
        });
    }, { passive: true });
}

// ==========================================
// MAIN RENDER
// ==========================================
function renderDetail(projects, container) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || projects[0].id;
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        container.innerHTML = `
            <section class="detail-section detail-404">
                <h1 class="detail-404-title">404</h1>
                <p class="detail-404-desc">This project doesn't exist or has been moved.</p>
                <a href="archive.html" class="cta-link">BACK TO ARCHIVE <span class="arrow">→</span></a>
            </section>`;
        return;
    }

    document.title = `${project.title} — Project Detail`;

    const sections = [
        buildHeroSection(project),
        buildOverviewSection(project),
        ...buildContentSections(project),
        buildExhibitionSection(project),
        buildGallerySection(project),
        buildLinksSection(project),
        buildCreditsSection(project),
        buildNextProjectSection(projects, projectId),
    ].filter(Boolean);

    container.innerHTML = sections.map(s => s.html).join('');

    // Side Nav
    const navTrack = document.getElementById('sideNavTrack');
    if (navTrack) {
        const navSections = sections.filter(s => s.id);
        navTrack.innerHTML = navSections.map((s, i) => `
            <a href="#${s.id}" class="side-nav-item${i === 0 ? ' active' : ''}" data-index="${String(i + 1).padStart(2, '0')}">
                <span class="side-nav-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="side-nav-label">${s.navLabel}</span>
            </a>
        `).join('');

        initDetailScrollSpy();
    }

    initDetailAnimations();
    initGalleryAutoLayout();
    initYouTubeLazyLoad();
    initScrollProgress();
}

// ==========================================
// SECTION BUILDERS
// ==========================================

function buildHeroSection(project) {
    const heroImg = parseImage(project.image);

    const heroCreditHTML = heroImg.credit
        ? `<span class="gallery-item-credit">${escapeHTML(heroImg.credit)}</span>`
        : '';

    return {
        id: 'detail-hero',
        navLabel: 'HERO',
        navSub: 'Project<br>Introduction',
        html: `
            <section class="detail-section detail-hero" id="detail-hero">
                <div class="detail-hero-grid">
                    <div class="detail-hero-text">
                        <span class="detail-project-label">PROJECT ${project.id}</span>
                        <h1 class="detail-project-title">${escapeHTML(project.title)}</h1>
                        <div class="detail-hero-meta">
                            <span>${project.categoryLabel}</span>
                            <span>${project.year}</span>
                        </div>
                        <div class="detail-hero-divider"></div>
                        <p class="detail-hero-desc">${escapeHTML(project.desc)}</p>
                    </div>
                    <div class="detail-hero-media">
                        <div class="detail-hero-media-inner">
                            <img src="${heroImg.src}" alt="${escapeHTML(project.title)}" loading="lazy">
                        </div>
                        ${heroCreditHTML}
                    </div>
                </div>
                <div class="detail-scroll-hint">SCROLL ↓</div>
            </section>`
    };
}

function buildOverviewSection(project) {
    const toolsStr = project.tags ? project.tags.join('<br>') : '—';
    const exhibitionName = project.exhibition ? project.exhibition.name : null;

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
    if (!project.content || project.content.length === 0) return [];
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
    let exDetails = '';
    if (ex.date) exDetails += `<div class="spec-row"><span class="spec-key">DATE</span><span class="spec-val">${ex.date}</span></div>`;
    if (ex.hours) exDetails += `<div class="spec-row"><span class="spec-key">HOURS</span><span class="spec-val">${ex.hours}</span></div>`;
    if (ex.location) exDetails += `<div class="spec-row"><span class="spec-key">LOCATION</span><span class="spec-val">${ex.location}</span></div>`;
    if (ex.event) exDetails += `<div class="spec-row"><span class="spec-key">EVENT</span><span class="spec-val">${ex.event}</span></div>`;
    const exLink = ex.url
    ? externalLink(ex.url, 'EVENT WEBSITE <span class="arrow">→</span>', 'detail-doc-link detail-mt-24')
    : '';

    return {
        id: 'detail-exhibition',
        navLabel: 'EXHIBITION',
        navSub: 'Venue<br>&amp; Dates',
        html: `
            <section class="detail-section" id="detail-exhibition">
                <div class="detail-section-header"><h2 class="detail-section-title">Exhibition</h2></div>
                <h3 class="exhibition-subtitle">${ex.name}</h3>
                <div class="technical-specs-list">${exDetails}</div>
                ${exLink}
            </section>`
    };
}

function buildGallerySection(project) {
    const hasLayout = project.galleryLayout && project.galleryLayout.length > 0;
    const hasGallery = project.gallery && project.gallery.length > 0;

    if (!hasLayout && !hasGallery) return null;

    let galleryInnerHTML = '';
    let useAutoLayout = false;

    if (hasLayout) {
        // galleryLayout：每張一行，滿版
        let figCount = 0;
        galleryInnerHTML = project.galleryLayout.map(row => {
            // 攤平成單張處理
            return row.map(item => {
                figCount++;
                const img = parseImage(item);
                const creditHTML = img.credit
                    ? `<span class="gallery-item-credit">${escapeHTML(img.credit)}</span>`
                    : '';
                return `
                    <div class="gallery-row-full">
                        <div class="gallery-item-media">
                            <img src="${img.src}" alt="${escapeHTML(project.title)} — Fig.${String(figCount).padStart(2, '0')}" loading="lazy">
                        </div>
                        <div class="gallery-item-caption">
                            <span class="fig-label">Fig.${String(figCount).padStart(2, '0')}</span>
                            <div class="fig-divider"></div>
                            ${creditHTML}
                        </div>
                    </div>`;
            }).join('');
        }).join('');
    } else {
        // gallery：走自動排版，先放 skeleton，等圖片載入後再排
        useAutoLayout = true;
        const allImages = project.gallery.map(item => parseImage(item));
        galleryInnerHTML = `
            <div id="galleryAutoLayout"
                 data-images='${JSON.stringify(allImages)}'
                 data-title="${escapeHTML(project.title)}">
                <div class="skeleton-pulse" style="width:100%;aspect-ratio:16/9;"></div>
            </div>`;
    }

    return {
        id: 'detail-gallery',
        navLabel: 'GALLERY',
        navSub: 'Installation<br>&amp; Details',
        html: `
            <section class="detail-section detail-gallery" id="detail-gallery">
                <div class="detail-section-header"><h2 class="detail-section-title">Gallery</h2></div>
                <div class="detail-gallery-list">${galleryInnerHTML}</div>
            </section>`
    };
}

function initGalleryAutoLayout() {
    const container = document.getElementById('galleryAutoLayout');
    if (!container) return;

    const images = JSON.parse(container.dataset.images);
    const projectTitle = container.dataset.title;

    const loadPromises = images.map(img => {
        return new Promise(resolve => {
            const el = new Image();
            el.onload = () => resolve({
                ...img,
                width: el.naturalWidth,
                height: el.naturalHeight,
                orientation: el.naturalWidth >= el.naturalHeight ? 'landscape' : 'portrait'
            });
            el.onerror = () => resolve({
                ...img,
                width: 16,
                height: 9,
                orientation: 'landscape'
            });
            el.src = img.src;
        });
    });

    Promise.all(loadPromises).then(loaded => {
        const rows = buildAutoRows(loaded);
        let figCount = 0;

        container.innerHTML = rows.map(row => {
            const figs = row.images.map(() => {
                figCount++;
                return figCount;
            });

            const classMap = {
                'landscape': 'gallery-row-landscape',
                'landscape-single': 'gallery-row-landscape-single',
                'portrait': 'gallery-row-portrait',
                'portrait-double': 'gallery-row-portrait-double',
                'portrait-single': 'gallery-row-portrait-single'
            };

            return buildRowHTML(row.images, figs, projectTitle, classMap[row.type] || 'gallery-row-full');
        }).join('');

        initGalleryReveal();
        initGalleryImageLoad();
    });
}

function buildAutoRows(images) {
    const rows = [];
    let i = 0;

    while (i < images.length) {
        const orientation = images[i].orientation;
        const group = [];

        // 連續收集同方向的圖片
        while (i < images.length && images[i].orientation === orientation) {
            group.push(images[i]);
            i++;
        }

        if (orientation === 'landscape') {
            for (let j = 0; j < group.length; j += 2) {
                if (j + 1 < group.length) {
                    rows.push({ type: 'landscape', images: [group[j], group[j + 1]] });
                } else {
                    rows.push({ type: 'landscape-single', images: [group[j]] });
                }
            }
        } else {
            for (let j = 0; j < group.length; j += 3) {
                const remaining = group.length - j;
                if (remaining >= 3) {
                    rows.push({ type: 'portrait', images: [group[j], group[j + 1], group[j + 2]] });
                } else if (remaining === 2) {
                    rows.push({ type: 'portrait-double', images: [group[j], group[j + 1]] });
                } else {
                    rows.push({ type: 'portrait-single', images: [group[j]] });
                }
            }
        }
    }

    return rows;
}


function buildRowHTML(images, figs, title, rowClass) {
    const itemsHTML = images.map((img, i) => {
        const figNum = String(figs[i]).padStart(2, '0');
        const creditHTML = img.credit
            ? `<span class="gallery-item-credit">${escapeHTML(img.credit)}</span>`
            : '';

        return `
            <div class="gallery-pair-item">
                <div class="gallery-item-media">
                    <img src="${img.src}" alt="${title} — Fig.${figNum}" loading="lazy">
                </div>
                <div class="gallery-item-caption">
                    <span class="fig-label">Fig.${figNum}</span>
                    <div class="fig-divider"></div>
                    ${creditHTML}
                </div>
            </div>`;
    }).join('');

    return `<div class="${rowClass}">${itemsHTML}</div>`;
}

function initGalleryReveal() {
    const items = document.querySelectorAll(
        '.gallery-row-full, .gallery-row-landscape, .gallery-row-landscape-single, .gallery-row-portrait, .gallery-row-portrait-double, .gallery-row-portrait-single'
    );
    if (items.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        visible.forEach((entry, i) => {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

    items.forEach(item => observer.observe(item));
}

function initGalleryImageLoad() {
    document.querySelectorAll('.gallery-item-media img').forEach(img => {
        const markLoaded = () => img.closest('.gallery-item-media')?.classList.add('is-loaded');
        if (img.complete) markLoaded();
        else img.addEventListener('load', markLoaded, { once: true });
    });
}

function buildLinksSection(project) {
    if (!project.links || Object.keys(project.links).length === 0) return null;

    const linkEntries = Object.entries(project.links);

    // 找所有 YouTube 連結（可能有多個）
    const ytEntries = linkEntries.filter(([key, val]) =>
        val.includes('youtube.com/watch') ||
        val.includes('youtu.be') ||
        val.includes('youtube.com/shorts')
    );

    // 嵌入第一個 YT 影片
    let videoEmbedHTML = '';
    if (ytEntries.length > 0) {
        const ytId = extractYouTubeId(ytEntries[0][1]);
        if (ytId) {
            videoEmbedHTML = `
                <div class="doc-video-wrapper" id="ytPlayer" data-yt-id="${ytId}">
                    <img src="https://img.youtube.com/vi/${ytId}/maxresdefault.jpg"
                         alt="Video thumbnail"
                         class="doc-video-poster">
                    <button class="doc-play-btn" aria-label="Play video">
                        <span class="play-icon"></span>
                    </button>
                </div>`;
        }
    }

    // 非第一個 YT 的所有連結都列出來
    const firstYtUrl = ytEntries.length > 0 ? ytEntries[0][1] : null;
    const otherLinks = linkEntries.filter(([key, val]) => val !== firstYtUrl);

    const linksListHTML = otherLinks.length > 0
        ? `<div class="detail-doc-link-list">
            ${otherLinks.map(([key, val]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return externalLink(val, `${label} <span class="arrow">→</span>`, 'detail-doc-link');
            }).join('')}
        </div>`
        : '';

    // 如果沒有影片也沒有其他連結，不顯示這個區塊
    if (!videoEmbedHTML && !linksListHTML) return null;

    return {
        id: 'detail-documentation',
        navLabel: 'LINKS',
        navSub: 'Video<br>&amp; Links',
        html: `
            <section class="detail-section detail-documentation" id="detail-documentation">
                <div class="detail-section-header"><h2 class="detail-section-title">Documentation</h2></div>
                ${videoEmbedHTML}
                ${linksListHTML}
            </section>`
    };
}

function buildCreditsSection(project) {
    const hasCredits = project.credits && Object.keys(project.credits).length > 0;
    const hasCollaborators = project.collaborators && project.collaborators.length > 0;

    if (!hasCredits && !hasCollaborators) return null;

    let creditItems = '';
    if (hasCredits) {
        creditItems = Object.entries(project.credits).map(([role, name]) => `
            <div class="credit-item"><span class="credit-role">${role.toUpperCase()}</span><span class="credit-name">${escapeHTML(name)}</span></div>`
        ).join('');
    }

    let collabHTML = '';
    if (hasCollaborators) {
        const collabClass = hasCredits ? 'credit-item credit-item--spaced' : 'credit-item credit-item--full';
        collabHTML = `<div class="${collabClass}"><span class="credit-role">COLLABORATORS</span><span class="credit-name">${project.collaborators.join('、')}</span></div>`;
    }

    return {
        id: 'detail-credits',
        navLabel: 'CREDITS',
        navSub: 'Team<br>&amp; Credits',
        html: `
            <section class="detail-section detail-credits" id="detail-credits">
                <div class="detail-section-header"><h2 class="detail-section-title">Credits</h2></div>
                <div class="credits-grid">${creditItems}${collabHTML}</div>
            </section>`
    };
}

function buildNextProjectSection(projects, currentId) {
    const currentIdx = projects.findIndex(p => p.id === currentId);
    const prevProject = projects[(currentIdx - 1 + projects.length) % projects.length];
    const nextProject = projects[(currentIdx + 1) % projects.length];

    return {
        id: null,
        html: `
            <section class="detail-section detail-project-nav">
                <a href="archive.html" class="project-nav-back">← BACK TO ARCHIVE</a>
                <div class="project-nav-grid">
                    <a href="project-detail.html?id=${prevProject.id}" class="project-nav-item project-nav-prev">
                        <span class="project-nav-label">← PREVIOUS PROJECT</span>
                        <h3 class="project-nav-title">${prevProject.title}</h3>
                        <span class="project-nav-year">${prevProject.year}</span>
                    </a>
                    <a href="project-detail.html?id=${nextProject.id}" class="project-nav-item project-nav-next">
                        <span class="project-nav-label">NEXT PROJECT →</span>
                        <h3 class="project-nav-title">${nextProject.title}</h3>
                        <span class="project-nav-year">${nextProject.year}</span>
                    </a>
                </div>
            </section>`
    };
}

// ==========================================
// UTILITIES
// ==========================================

function extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/);
    return match ? match[1] : null;
}

// ==========================================
// SCROLL SPY
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

    const visibleSections = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target);
            } else {
                visibleSections.delete(entry.target);
            }
        });

        // 從所有可見的 section 中，找最上面的那個
        if (visibleSections.size === 0) return;

        let topSection = null;
        let topOffset = Infinity;

        visibleSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < topOffset) {
                topOffset = rect.top;
                topSection = section;
            }
        });

        if (topSection) {
            const id = topSection.getAttribute('id');
            sideNavItems.forEach(nav => {
                nav.classList.toggle('active', nav.getAttribute('href') === '#' + id);
            });
        }
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    detailSections.forEach(section => observer.observe(section));
}

// ==========================================
// ANIMATIONS
// ==========================================
function initDetailAnimations() {
    // Hero cascade
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

    document.querySelectorAll('.gallery-item-media img').forEach(img => {
        const markLoaded = () => img.closest('.gallery-item-media')?.classList.add('is-loaded');
        if (img.complete) markLoaded();
        else img.addEventListener('load', markLoaded, { once: true });
    });

    // Image parallax
    initDetailImageParallax();
}

function initDetailImageParallax() {
    const images = document.querySelectorAll('.gallery-item-media img, .detail-hero-media-inner img');
    if (images.length === 0) return;

    // 用 Set 追蹤可見圖片，避免遍歷所有圖片
    const visibleImages = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleImages.add(entry.target);
            } else {
                visibleImages.delete(entry.target);
                entry.target.style.transform = ''; // 離開視口時重置
            }
        });
    }, { rootMargin: '50px 0px', threshold: 0 });

    images.forEach(img => observer.observe(img));

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking || visibleImages.size === 0) return;
        ticking = true;
        requestAnimationFrame(() => {
            const viewCenter = window.innerHeight / 2;
            visibleImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const offset = (center - viewCenter) * 0.04;
                img.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
        });
    }, { passive: true });
}

function parseImage(item) {
    if (typeof item === 'string') {
        return { src: item, credit: null };
    }
    return { src: item.src, credit: item.credit || null };
}

function initYouTubeLazyLoad() {
    const wrapper = document.getElementById('ytPlayer');
    if (!wrapper) return;

    wrapper.addEventListener('click', () => {
        const ytId = wrapper.dataset.ytId;
        wrapper.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>`;
    }, { once: true });
}