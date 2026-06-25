/**
 * INDEX PAGE - WORKS SECTION LOADER
 * 動態載入首頁的 Selected Works
 */

class IndexWorksLoader {
    constructor() {
        this.projects = [];
        this.featuredProject = null;
        this.selectedProjects = [];
    }

    async init() {
        try {
            await this.loadProjects();
            this.renderFeaturedWork();
            this.renderWorksGrid();
            this.initFilter();
            console.log('✅ Index works section loaded');
        } catch (error) {
            console.error('❌ Failed to load works:', error);
            this.showError();
        }
    }

    // ========================================================================
    // 載入專案數據
    // ========================================================================
    async loadProjects() {
        const response = await fetch('data/projects-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.projects = data.projects;
        
        // 找出 Featured 專案
        this.featuredProject = this.projects.find(p => p.featured);
        
        // 選出前 6 個專案（排除 featured）
        this.selectedProjects = this.projects
            .filter(p => !p.featured)
            .slice(0, 6);
    }

    // ========================================================================
    // 渲染 Featured Work
    // ========================================================================
    renderFeaturedWork() {
        const container = document.getElementById('featured-work-container');
        if (!container || !this.featuredProject) return;

        const project = this.featuredProject;
        
        container.innerHTML = `
            <div class="featured-media">
                <img src="${project.thumbnail}" alt="${project.title}">
                <div class="featured-overlay">
                    <div class="featured-content">
                        <span class="featured-year">${project.year}</span>
                        <h3 class="featured-title">${project.title}</h3>
                        <p class="featured-description">${project.description}</p>
                        <div class="featured-tags">
                            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <a href="project-detail.html?id=${project.id}" class="featured-link">Explore Project →</a>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================================================
    // 渲染 Works Grid
    // ========================================================================
    renderWorksGrid() {
        const container = document.getElementById('works-grid-container');
        if (!container) return;

        container.innerHTML = this.selectedProjects.map(project => `
            <article class="work-card" data-category="${this.getCategorySlug(project.category)}">
                <div class="work-image">
                    <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
                    <div class="work-overlay">
                        <span class="view-project">View Project →</span>
                    </div>
                </div>
                <div class="work-info">
                    <h3 class="work-title">${project.title}</h3>
                    <p class="work-description">${project.description}</p>
                    <div class="work-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        // 為每張卡片添加點擊事件
        container.querySelectorAll('.work-card').forEach((card, index) => {
            const project = this.selectedProjects[index];
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.location.href = `project-detail.html?id=${project.id}`;
            });
        });
    }

    // ========================================================================
    // 過濾功能
    // ========================================================================
    initFilter() {
        const filterBtns = document.querySelectorAll('.works-filter .filter-btn');
        const workCards = document.querySelectorAll('.work-card');

        if (filterBtns.length === 0 || workCards.length === 0) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新按鈕狀態
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // 過濾卡片
                workCards.forEach((card, index) => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ========================================================================
    // 工具函數
    // ========================================================================
    getCategorySlug(category) {
        const map = {
            'Interactive Installation': 'interactive',
            'Workshop': 'interactive',
            'Installation': 'interactive',
            'VR Experience': 'vr',
            'AR Experience': 'vr',
            'Generative Art': 'creative-coding',
            'Web Experience': 'web',
            'Audio Visual': 'creative-coding'
        };
        return map[category] || category.toLowerCase().replace(/\s+/g, '-');
    }

    showError() {
        const featuredContainer = document.getElementById('featured-work-container');
        const gridContainer = document.getElementById('works-grid-container');
        
        const errorHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(232, 232, 232, 0.6);">
                <p>Failed to load projects. <a href="#" onclick="location.reload()" style="color: #e8e8e8; text-decoration: underline;">Retry</a></p>
            </div>
        `;
        
        if (featuredContainer) featuredContainer.innerHTML = errorHTML;
        if (gridContainer) gridContainer.innerHTML = errorHTML;
    }
}

// ========================================================================
// 初始化
// ========================================================================
let indexWorksLoaderInstance = null;

function initIndexWorks() {
    // 只在首頁初始化
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && window.location.pathname !== '') {
        return;
    }

    if (indexWorksLoaderInstance) {
        console.log('Index works loader already initialized');
        return;
    }

    indexWorksLoaderInstance = new IndexWorksLoader();
    indexWorksLoaderInstance.init();
}

// 執行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndexWorks);
} else {
    initIndexWorks();
}