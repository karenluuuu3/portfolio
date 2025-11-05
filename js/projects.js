/**
 * PROJECTS PAGE - HYBRID MODE
 * HTML 靜態專案 + JSON 動態載入
 */

class ProjectsManager {
    constructor() {
        this.allProjects = []; // 所有專案（HTML + JSON）
        this.staticProjects = []; // HTML 中的靜態專案
        this.dynamicProjects = []; // JSON 中的動態專案
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.currentSort = 'latest';
        this.displayCount = 9;
        this.currentDisplayed = 0;
    }

    async init() {
        // 1. 先讀取 HTML 中的靜態專案
        this.parseStaticProjects();
        
        // 2. 載入 JSON 動態專案
        await this.loadDynamicProjects();
        
        // 3. 合併所有專案
        this.mergeProjects();
        
        // 4. 初始化 UI
        this.setupFilters();
        this.setupSort();
        this.renderDynamicProjects();
        this.setupLoadMore();
        this.updateFilterCounts();
        
        console.log('Projects Manager initialized ✨');
        console.log(`Static: ${this.staticProjects.length}, Dynamic: ${this.dynamicProjects.length}, Total: ${this.allProjects.length}`);
    }

    // ========================================================================
    // 解析 HTML 中的靜態專案
    // ========================================================================
    parseStaticProjects() {
        const staticCards = document.querySelectorAll('.project-card[data-static="true"]');
        
        staticCards.forEach(card => {
            const project = {
                id: this.extractIdFromLink(card),
                title: card.querySelector('.card-title')?.textContent || '',
                category: card.querySelector('.card-category')?.textContent || '',
                year: parseInt(card.getAttribute('data-year')) || 2024,
                featured: card.classList.contains('featured'),
                thumbnail: card.querySelector('.card-image img')?.src || '',
                description: card.querySelector('.card-description')?.textContent || '',
                tags: Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent),
                isStatic: true,
                element: card // 保留 DOM 元素引用
            };
            
            this.staticProjects.push(project);
        });
    }

    extractIdFromLink(card) {
        const link = card.querySelector('.card-link');
        if (!link) return '';
        
        const href = link.getAttribute('href');
        const match = href.match(/id=([^&]+)/);
        return match ? match[1] : '';
    }

    // ========================================================================
    // 載入 JSON 動態專案
    // ========================================================================
    async loadDynamicProjects() {
        try {
            const response = await fetch('data/projects-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 過濾掉已經在 HTML 中的專案（避免重複）
            const staticIds = this.staticProjects.map(p => p.id);
            this.dynamicProjects = data.projects.filter(p => !staticIds.includes(p.id));
            
            // 移除 loading indicator
            const loading = document.querySelector('.projects-loading');
            if (loading) {
                loading.remove();
            }
            
        } catch (error) {
            console.error('Failed to load dynamic projects:', error);
            this.showLoadError();
        }
    }

    // ========================================================================
    // 合併靜態和動態專案
    // ========================================================================
    mergeProjects() {
        this.allProjects = [...this.staticProjects, ...this.dynamicProjects];
        this.filteredProjects = [...this.allProjects];
        this.sortProjects();
    }

    // ========================================================================
    // 渲染動態專案（靜態專案已在 HTML 中）
    // ========================================================================
    renderDynamicProjects(append = false) {
        const container = document.getElementById('projects-container');
        
        // 計算要渲染的專案
        const start = append ? this.currentDisplayed : this.staticProjects.length;
        const projectsToRender = this.filteredProjects.filter(p => !p.isStatic);
        const end = Math.min(
            append ? this.currentDisplayed + this.displayCount : this.displayCount,
            projectsToRender.length
        );
        
        const projectsToShow = projectsToRender.slice(
            append ? this.currentDisplayed - this.staticProjects.length : 0,
            end - this.staticProjects.length
        );

        projectsToShow.forEach((project, index) => {
            const card = this.createProjectCard(project);
            container.appendChild(card);
            
            // 進場動畫
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });

        this.currentDisplayed = this.staticProjects.length + (end - this.staticProjects.length);
        this.updateLoadMoreButton();
    }

    // ========================================================================
    // 創建專案卡片
    // ========================================================================
    createProjectCard(project) {
        const article = document.createElement('article');
        article.className = `project-card ${project.featured ? 'featured' : ''}`;
        article.setAttribute('data-category', this.getCategorySlug(project.category));
        article.setAttribute('data-year', project.year);
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = 'all 0.6s ease';

        article.innerHTML = `
            <a href="project-detail.html?id=${project.id}" class="card-link">
                <div class="card-image">
                    <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
                    ${project.featured ? '<div class="card-badge">Featured</div>' : ''}
                    <div class="card-overlay">
                        <span class="view-detail">View Details →</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="card-year">${project.year}</span>
                        <span class="card-category">${project.category}</span>
                    </div>
                    <h3 class="card-title">${project.title}</h3>
                    <p class="card-description">${project.description}</p>
                    <div class="card-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;

        return article;
    }

    // ========================================================================
    // 過濾功能
    // ========================================================================
    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.currentFilter = filter;
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.applyFilter();
            });
        });
    }

    applyFilter() {
        const allCards = document.querySelectorAll('.project-card');
        
        allCards.forEach(card => {
            const category = this.getCategorySlug(card.querySelector('.card-category')?.textContent || '');
            const shouldShow = this.currentFilter === 'all' || category === this.currentFilter;
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // 更新過濾後的專案列表
        if (this.currentFilter === 'all') {
            this.filteredProjects = [...this.allProjects];
        } else {
            this.filteredProjects = this.allProjects.filter(project => {
                const categorySlug = this.getCategorySlug(project.category);
                return categorySlug === this.currentFilter;
            });
        }

        this.updateLoadMoreButton();
    }

    // ========================================================================
    // 排序功能
    // ========================================================================
    setupSort() {
        const sortBtn = document.querySelector('.sort-btn');
        const sortDropdown = document.querySelector('.sort-dropdown');
        const sortOptions = document.querySelectorAll('.sort-option');
        
        if (sortBtn && sortDropdown) {
            sortBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sortDropdown.classList.toggle('active');
            });
            
            document.addEventListener('click', () => {
                sortDropdown.classList.remove('active');
            });
        }
        
        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const sortType = option.getAttribute('data-sort');
                this.currentSort = sortType;
                
                sortOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // 更新按鈕文字
                if (sortBtn) {
                    const textNode = Array.from(sortBtn.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = `Sort by: ${option.textContent}`;
                    }
                }
                
                this.applySorting();
                sortDropdown.classList.remove('active');
            });
        });
    }

    applySorting() {
        this.sortProjects();
        
        const container = document.getElementById('projects-container');
        const allCards = Array.from(document.querySelectorAll('.project-card'));
        
        // 按照新的順序重新排列 DOM
        allCards.sort((a, b) => {
            const yearA = parseInt(a.getAttribute('data-year'));
            const yearB = parseInt(b.getAttribute('data-year'));
            const titleA = a.querySelector('.card-title')?.textContent || '';
            const titleB = b.querySelector('.card-title')?.textContent || '';
            
            switch (this.currentSort) {
                case 'latest':
                    return yearB - yearA;
                case 'oldest':
                    return yearA - yearB;
                case 'name':
                    return titleA.localeCompare(titleB);
                default:
                    return 0;
            }
        });
        
        allCards.forEach(card => container.appendChild(card));
    }

    sortProjects() {
        this.filteredProjects.sort((a, b) => {
            switch (this.currentSort) {
                case 'latest':
                    return b.year - a.year;
                case 'oldest':
                    return a.year - b.year;
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    // ========================================================================
    // Load More 功能
    // ========================================================================
    setupLoadMore() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </svg>
                    Loading...
                `;
                loadMoreBtn.disabled = true;
                
                setTimeout(() => {
                    this.renderDynamicProjects(true);
                    loadMoreBtn.innerHTML = `
                        Load More Projects
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    `;
                    loadMoreBtn.disabled = false;
                }, 800);
            });
        }
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        const visibleDynamicCount = this.currentDisplayed - this.staticProjects.length;
        const totalDynamicCount = this.filteredProjects.filter(p => !p.isStatic).length;
        
        if (loadMoreBtn) {
            if (visibleDynamicCount >= totalDynamicCount) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'flex';
            }
        }
    }

    // ========================================================================
    // 更新過濾器計數
    // ========================================================================
    updateFilterCounts() {
        const counts = {
            all: this.allProjects.length,
            interactive: 0,
            vr: 0,
            'creative-coding': 0,
            web: 0
        };

        this.allProjects.forEach(project => {
            const category = this.getCategorySlug(project.category);
            if (category === 'interactive') counts.interactive++;
            if (category === 'vr') counts.vr++;
            if (project.tags.some(t => t.toLowerCase().includes('glsl') || t.toLowerCase().includes('processing'))) {
                counts['creative-coding']++;
            }
            if (project.tags.some(t => t.toLowerCase().includes('web'))) {
                counts.web++;
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            const countSpan = btn.querySelector('.count');
            if (countSpan && counts[filter] !== undefined) {
                countSpan.textContent = counts[filter];
            }
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

    showLoadError() {
        const loading = document.querySelector('.projects-loading');
        if (loading) {
            loading.innerHTML = `
                <p style="color: rgba(232, 232, 232, 0.6);">
                    Failed to load additional projects. <a href="#" onclick="location.reload()" style="color: #e8e8e8; text-decoration: underline;">Retry</a>
                </p>
            `;
        }
    }
}

// ========================================================================
// 初始化
// ========================================================================
let projectsManagerInstance = null;

function initProjectsPage() {
    if (projectsManagerInstance) {
        console.log('Projects manager already initialized');
        return;
    }
    
    projectsManagerInstance = new ProjectsManager();
    projectsManagerInstance.init();
}

// Loading screen
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 500);
    }
});

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
    initProjectsPage();
}

// 添加 spin 動畫
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);