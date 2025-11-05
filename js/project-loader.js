class ProjectLoader {
    constructor() {
        this.projectData = null;
        this.currentProjectId = null;
        this.iconsMap = {
            'grid': '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="currentColor" stroke-width="2"/>',
            'layers': '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            'activity': '<path d="M20 7h-9M14 17H5M15 10v4M8 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>',
            'zap': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
            'github': '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        };
    }

    // 初始化
// 初始化
async init() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }

    this.currentProjectId = this.getProjectIdFromURL();
    
    if (!this.currentProjectId) {
        console.error('No project ID in URL');
        this.showErrorMessage('請從作品集頁面選擇專案', 'projects.html');
        return;
    }

    try {
        await this.loadProjectData();
        
        if (!this.projectData) {
            throw new Error('Project not found');
        }
        
        this.renderProject();
        
        // 初始化 AOS 動畫
        setTimeout(() => {
            if (typeof initAOS === 'function') {
                initAOS();
            }
        }, 100);
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
        
    } catch (error) {
        console.error('Failed to load project:', error);
        this.showErrorMessage('找不到此專案', 'projects.html');
    }
}

// 新增錯誤訊息顯示方法
showErrorMessage(message, redirectUrl) {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div style="text-align: center; color: #e8e8e8;">
                <h2 style="font-size: 32px; margin-bottom: 20px; font-weight: 300;">${message}</h2>
                <p style="margin-bottom: 30px; color: rgba(232, 232, 232, 0.6);">即將返回作品集頁面...</p>
                <div class="loader"></div>
            </div>
        `;
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 2000);
    }
}




    // 從 URL 獲取專案 ID
    getProjectIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // 載入專案資料
    async loadProjectData() {
        const response = await fetch('../data/projects-data.json');
        const data = await response.json();
        this.projectData = data.projects.find(p => p.id === this.currentProjectId);
        
        if (!this.projectData) {
            throw new Error('Project not found');
        }
    }

    // 渲染整個專案頁面
    renderProject() {
        this.updatePageTitle();
        this.renderHero();
        this.renderInfoCard();
        this.renderAbout();
        this.renderGallery();
        this.renderTechnical();
        this.renderProcess();
        this.renderRelated();
    }

    // 更新頁面標題
    updatePageTitle() {
        document.title = `${this.projectData.title} | karenlu3`;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.projectData.about.leadText;
        }
    }

    // 渲染 Hero Section
renderHero() {
    const { hero, title, category } = this.projectData;
    
    // 更新 video/poster
    const videoSource = document.querySelector('.hero-media video source');
    const video = document.querySelector('.hero-media video');
    const heroMediaDiv = document.querySelector('.hero-media');
    
    if (hero.video && videoSource && video) {
        // 有影片時使用影片
        videoSource.src = hero.video;
        video.poster = hero.poster;
        video.load();
    } else if (hero.poster && heroMediaDiv) {
        // 沒影片時改用圖片
        heroMediaDiv.innerHTML = `<img src="${hero.poster}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    // 更新文字內容
    const heroCategory = document.querySelector('.hero-category');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroCategory) heroCategory.textContent = category;
    if (heroTitle) heroTitle.textContent = title;
    if (heroSubtitle) heroSubtitle.textContent = hero.subtitle;
}

    // 渲染 Info Card
    renderInfoCard() {
        const { year, category, info } = this.projectData;

        // 更新年份
        const yearElement = document.querySelector('.info-group:nth-child(1) p');
        if (yearElement) yearElement.textContent = year;
        
        // 更新類別
        const categoryElement = document.querySelector('.info-group:nth-child(2) p');
        if (categoryElement) categoryElement.textContent = category;

        // 更新工具標籤
        const tagsContainer = document.querySelector('.info-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = info.tools.map(tool => 
                `<span class="info-tag">${tool}</span>`
            ).join('');
        }

        // 更新連結
        const linksContainer = document.querySelector('.info-links');
        if (linksContainer) {
            linksContainer.innerHTML = info.links.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener" class="info-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        ${this.iconsMap[link.icon] || this.iconsMap.link}
                    </svg>
                    <span>${link.name}</span>
                </a>
            `).join('');
        }
    }

    // 渲染 About Section
    renderAbout() {
        const { about } = this.projectData;

        // 更新 Lead Text
        const leadText = document.querySelector('.lead-text');
        if (leadText) leadText.textContent = about.leadText;

        // 更新段落
        const contentText = document.querySelector('.content-text');
        if (contentText) {
            const existingParagraphs = contentText.querySelectorAll('p:not(.lead-text)');
            existingParagraphs.forEach(p => p.remove());

            about.paragraphs.forEach(text => {
                const p = document.createElement('p');
                p.textContent = text;
                contentText.appendChild(p);
            });
        }

        // 更新 Highlights
        const highlightsContainer = document.querySelector('.content-highlights');
        if (highlightsContainer) {
            highlightsContainer.innerHTML = about.highlights.map(h => `
                <div class="highlight-item">
                    <h3>${h.title}</h3>
                    <p>${h.description}</p>
                </div>
            `).join('');
        }
    }

    // 渲染 Gallery
    renderGallery() {
        const { gallery } = this.projectData;
        const container = document.querySelector('#gallery .section-container-wide');
        
        if (!container) return;
        
        // 保存 header
        const header = container.querySelector('.section-header-center');
        const headerHTML = header ? header.outerHTML : '';
        
        // 清空容器
        container.innerHTML = headerHTML;

        // Full Images
        if (gallery.full && gallery.full.length > 0) {
            gallery.full.forEach(img => {
                const div = document.createElement('div');
                div.className = 'gallery-item-full';
                div.setAttribute('data-aos', 'fade-up');
                div.innerHTML = `
                    <img src="${img.src}" alt="${img.caption}" loading="lazy">
                    ${img.caption ? `<p class="gallery-caption">${img.caption}</p>` : ''}
                `;
                container.appendChild(div);
            });
        }

        // Grid 2
        if (gallery.grid2 && gallery.grid2.length > 0) {
            const grid2 = document.createElement('div');
            grid2.className = 'gallery-grid-2';
            grid2.innerHTML = gallery.grid2.map((img, i) => `
                <div class="gallery-item" data-aos="fade-up" data-aos-delay="${(i + 1) * 100}">
                    <img src="${img.src}" alt="${img.caption}" loading="lazy">
                    ${img.caption ? `<p class="gallery-caption">${img.caption}</p>` : ''}
                </div>
            `).join('');
            container.appendChild(grid2);
        }

        // Grid 3
        if (gallery.grid3 && gallery.grid3.length > 0) {
            const grid3 = document.createElement('div');
            grid3.className = 'gallery-grid-3';
            grid3.innerHTML = gallery.grid3.map((img, i) => `
                <div class="gallery-item" data-aos="fade-up" data-aos-delay="${(i + 1) * 100}">
                    <img src="${img.src}" alt="${img.caption}" loading="lazy">
                </div>
            `).join('');
            container.appendChild(grid3);
        }

        // Video
        if (gallery.video) {
            const videoDiv = document.createElement('div');
            videoDiv.className = 'gallery-video';
            videoDiv.setAttribute('data-aos', 'fade-up');
            videoDiv.innerHTML = `
                <div class="video-wrapper">
                    <iframe src="${gallery.video.url}" 
                            title="${gallery.video.caption}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                    </iframe>
                </div>
                ${gallery.video.caption ? `<p class="gallery-caption">${gallery.video.caption}</p>` : ''}
            `;
            container.appendChild(videoDiv);
        }
    }

    // 渲染 Technical Details
    renderTechnical() {
        const { technical, code } = this.projectData;

        // 更新 Technical Cards
        const grid = document.querySelector('.technical-grid');
        if (grid) {
            grid.innerHTML = technical.map((item, i) => `
                <div class="technical-card" data-aos="fade-up" data-aos-delay="${i * 100}">
                    <div class="technical-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            ${this.iconsMap[item.icon] || ''}
                        </svg>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `).join('');
        }

        // 更新 Code Showcase
        if (code) {
            const codeLabel = document.querySelector('.code-label');
            const codeContent = document.querySelector('.code-content code');
            
            if (codeLabel) codeLabel.textContent = code.filename;
            if (codeContent) codeContent.textContent = code.content;
        }
    }

    // 渲染 Process Timeline
    renderProcess() {
        const { process } = this.projectData;
        const timeline = document.querySelector('.process-timeline');

        if (timeline) {
            timeline.innerHTML = process.map(item => `
                <div class="process-item ${item.reverse ? 'process-item-reverse' : ''}" 
                     data-aos="${item.reverse ? 'fade-left' : 'fade-right'}">
                    <div class="process-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="process-date">${item.date}</span>
                    </div>
                    <div class="process-media">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                    </div>
                </div>
            `).join('');
        }
    }

    // 渲染 Related Projects
    async renderRelated() {
        const { related } = this.projectData;
        
        if (!related || related.length === 0) return;

        try {
            const response = await fetch('../data/projects-data.json');
            const data = await response.json();
            const relatedProjects = data.projects.filter(p => related.includes(p.id)).slice(0, 3);

            const container = document.querySelector('.related-projects');
            if (container) {
                container.innerHTML = relatedProjects.map((project, i) => `
                    <a href="project-detail.html?id=${project.id}" class="related-project-card" data-aos="fade-up" data-aos-delay="${i * 100}">
                        <div class="related-project-image">
                            <img src="${project.hero.poster}" alt="${project.title}" loading="lazy">
                        </div>
                        <div class="related-project-info">
                            <h3>${project.title}</h3>
                            <p>${project.category}</p>
                            <span class="related-project-arrow">→</span>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load related projects:', error);
        }
    }

    // 顯示錯誤
    showError() {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 20px; background: #121212;">
                <h1 style="color: #e8e8e8; font-size: 48px; font-weight: 300;">Project Not Found</h1>
                <a href="projects.html" style="color: #a0a0a0; text-decoration: none; padding: 12px 24px; border: 1px solid #a0a0a0; border-radius: 30px; transition: all 0.3s;">
                    Back to Projects
                </a>
            </div>
        `;
    }
}

// =============================================================================
// 初始化邏輯
// =============================================================================

let projectLoaderInstance = null;
let isInitializing = false;

function initProjectLoader() {
    // 防止重複執行
    if (projectLoaderInstance || isInitializing) {
        console.log('Project loader already initialized or initializing');
        return;
    }
    
    // 檢查是否有 project ID
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('id')) {
        console.log('No project ID in URL, skipping project loader');
        return;
    }
    
    isInitializing = true;
    console.log('Starting project loader initialization...');
    
    projectLoaderInstance = new ProjectLoader();
    projectLoaderInstance.init()
        .then(() => {
            console.log('✅ Project loader initialized successfully');
        })
        .catch(error => {
            console.error('❌ Project loader initialization failed:', error);
        })
        .finally(() => {
            isInitializing = false;
        });
}

// 只執行一次
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectLoader, { once: true });
} else {
    initProjectLoader();
}