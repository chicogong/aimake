/**
 * AIMake 文档查看器
 * 参考设计: Stripe Docs, Vercel Docs, Tailwind CSS Docs
 * 特性: Markdown 渲染、代码高亮、搜索、暗色主题、目录导航
 */

class DocsViewer {
    constructor() {
        // 状态
        this.currentDoc = null;
        this.searchIndex = [];
        this.selectedSearchIndex = 0;

        // 文档结构
        this.docStructure = [
            {
                name: '开始使用',
                icon: '🚀',
                items: [
                    { name: '文档首页', path: 'README.md', icon: '📚' },
                ]
            },
            {
                name: '产品与规划',
                icon: '📋',
                items: [
                    { name: '产品规划', path: 'planning/product-plan.md', icon: '🎯' },
                    { name: '内容方向', path: 'planning/content-generation-directions.md', icon: '💡' },
                    { name: 'AI 供应商总览', path: 'planning/ai-providers-overview.md', icon: '🤖', badge: '推荐' },
                    { name: 'TTS 免费接入', path: 'planning/tts-free-providers.md', icon: '🔊' },
                    { name: 'TTS 供应商对比', path: 'planning/tts-providers-comparison.md', icon: '📊' },
                    { name: 'LLM & ASR 接入', path: 'planning/llm-asr-providers.md', icon: '🧠' },
                ]
            },
            {
                name: '技术设计',
                icon: '🔧',
                items: [
                    { name: '设计总览', path: 'design/design-research.md', icon: '🏗️', badge: '核心' },
                    { name: '后端架构', path: 'design/backend-architecture.md', icon: '⚙️', badge: '核心' },
                    { name: 'API 设计', path: 'design/api-design.md', icon: '🔌', badge: '核心' },
                    { name: '数据库设计', path: 'design/database-schema.md', icon: '🗄️', badge: '核心' },
                    { name: '前端架构', path: 'design/frontend-architecture.md', icon: '🎨', badge: '核心' },
                    { name: '错误处理', path: 'design/error-handling.md', icon: '🚨' },
                    { name: '登录鉴权', path: 'design/auth-design.md', icon: '🔐' },
                    { name: '支付集成', path: 'design/payment-integration.md', icon: '💳' },
                    { name: 'Prompt 工程', path: 'design/prompt-engineering.md', icon: '✨' },
                    { name: 'UI/UX 设计', path: 'design/ui-ux-design.md', icon: '🎨' },
                    { name: '页面设计', path: 'design/pages-design.md', icon: '📄' },
                    { name: '主页设计', path: 'design/landing-page-design.md', icon: '🏠' },
                    { name: '品牌视觉', path: 'design/brand-identity.md', icon: '🎭' },
                    { name: '国际化', path: 'design/i18n-design.md', icon: '🌍' },
                    { name: 'SEO 分析', path: 'design/seo-analytics.md', icon: '📈' },
                    { name: 'Figma 集成', path: 'design/figma-integration.md', icon: '🖼️' },
                    { name: '用户指引页面', path: 'design/user-guide-pages.md', icon: '📖' },
                    { name: 'APP 设计', path: 'design/app-design.md', icon: '📱' },
                ]
            },
            {
                name: '开发与运维',
                icon: '🚀',
                items: [
                    { name: '环境配置', path: 'development/env-config.md', icon: '⚙️', badge: '必读' },
                    { name: '代码规范', path: 'development/code-standards.md', icon: '📝' },
                    { name: '自动化开发', path: 'development/automation-plan.md', icon: '🤖' },
                    { name: '部署架构', path: 'development/deployment-architecture.md', icon: '☁️' },
                    { name: 'Cloudflare 部署', path: 'development/cloudflare-pages-deployment.md', icon: '🌐' },
                    { name: '性能优化', path: 'development/performance-optimization.md', icon: '⚡' },
                    { name: 'Landing 结构', path: 'development/landing-page-structure.md', icon: '🏗️' },
                    { name: '上线验证', path: 'development/release-verification.md', icon: '✅' },
                ]
            },
            {
                name: '研究笔记',
                icon: '🔬',
                items: [
                    { name: 'Notion MCP 指南', path: 'research/notion-mcp-server-guide.md', icon: '📓' },
                ]
            },
        ];

        // 扁平化文档列表
        this.docList = this.flattenDocs();

        // 初始化
        this.init();
    }

    // ==================== 初始化 ====================
    async init() {
        this.initTheme();
        this.renderSidebar();
        this.initSearch();
        this.initRouter();
        this.initScrollListener();
        this.initMobileMenu();
        await this.buildSearchIndex();
        console.log('📚 AIMake Docs 已初始化');
    }

    // ==================== 主题 ====================
    initTheme() {
        const theme = localStorage.getItem('docs-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('docs-theme', isDark ? 'dark' : 'light');
        });
    }

    // ==================== 侧边栏 ====================
    flattenDocs() {
        const result = [];
        this.docStructure.forEach(section => {
            section.items.forEach(item => {
                result.push({ ...item, section: section.name });
            });
        });
        return result;
    }

    renderSidebar() {
        const container = document.getElementById('doc-tree');
        if (!container) return;

        const html = this.docStructure.map(section => {
            const itemsHtml = section.items.map(item => {
                const badge = item.badge ? '<span class="nav-item-badge">' + item.badge + '</span>' : '';
                return '<a href="#!' + item.path + '" class="nav-item" data-path="' + item.path + '">' +
                    '<span class="nav-item-icon">' + (item.icon || '📄') + '</span>' +
                    '<span class="flex-1">' + item.name + '</span>' +
                    badge +
                '</a>';
            }).join('');

            return '<div class="nav-section" data-section="' + section.name + '">' +
                '<button class="nav-section-title w-full" onclick="docsViewer.toggleSection(\'' + section.name + '\')">' +
                    '<span class="flex items-center gap-2">' +
                        '<span>' + section.icon + '</span>' +
                        '<span>' + section.name + '</span>' +
                    '</span>' +
                    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>' +
                    '</svg>' +
                '</button>' +
                '<div class="nav-section-items">' + itemsHtml + '</div>' +
            '</div>';
        }).join('');

        container.innerHTML = html;
    }

    toggleSection(sectionName) {
        const section = document.querySelector('.nav-section[data-section="' + sectionName + '"]');
        if (section) {
            section.classList.toggle('collapsed');
        }
    }

    highlightActiveNav(path) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector('.nav-item[data-path="' + path + '"]');
        if (activeItem) {
            activeItem.classList.add('active');
            const section = activeItem.closest('.nav-section');
            if (section) {
                section.classList.remove('collapsed');
            }
        }
    }

    // ==================== 路由 ====================
    initRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#!"]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('href').substring(2);
                window.location.hash = '!' + path;
            }
        });

        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash;
        const path = hash.startsWith('#!') ? hash.substring(2) : 'README.md';
        this.loadDoc(path);
    }

    // ==================== 文档加载 ====================
    async loadDoc(path) {
        try {
            this.showLoading();

            const response = await fetch('../docs/' + path);
            if (!response.ok) {
                throw new Error('文档不存在: ' + path);
            }

            const markdown = await response.text();

            marked.setOptions({
                gfm: true,
                breaks: true,
                highlight: (code, lang) => {
                    if (Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return code;
                }
            });

            let html = marked.parse(markdown);
            html = this.processLinks(html, path);
            html = this.enhanceCodeBlocks(html);
            html = this.wrapTables(html);

            const cleanHtml = DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'hr', 'img', 'button', 'kbd', 'svg', 'path'],
                ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel', 'title', 'alt', 'src', 'data-lang', 'onclick', 'fill', 'stroke', 'viewBox', 'd', 'stroke-linecap', 'stroke-linejoin', 'stroke-width']
            });

            document.getElementById('doc-content').innerHTML = cleanHtml;
            Prism.highlightAll();

            this.currentDoc = path;
            this.updateBreadcrumb(path);
            this.updatePagination(path);
            this.updateTOC();
            this.highlightActiveNav(path);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.closeSidebar();

        } catch (error) {
            this.showError(error.message);
            console.error('文档加载失败:', error);
        }
    }

    processLinks(html, currentPath) {
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        return html
            .replace(/href="\.\/([^"]+\.md)"/g, 'href="#!' + currentDir + '/$1"')
            .replace(/href="\.\.\/([^"]+\.md)"/g, function(match, relativePath) {
                const parts = currentDir.split('/');
                parts.pop();
                return 'href="#!' + parts.join('/') + '/' + relativePath + '"';
            });
    }

    enhanceCodeBlocks(html) {
        // 将 <pre><code> 包装在一个容器中，并添加 header
        return html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, function(match, lang, code) {
            return '<div class="code-block-wrapper">' +
                '<div class="code-block-header">' +
                    '<span class="code-block-lang">' + lang + '</span>' +
                    '<button class="code-copy-btn" onclick="docsViewer.copyCode(this)">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>' +
                        '</svg>' +
                        '<span>复制</span>' +
                    '</button>' +
                '</div>' +
                '<pre><code class="language-' + lang + '">' + code + '</code></pre>' +
            '</div>';
        });
    }

    wrapTables(html) {
        return html.replace(/<table>/g, '<div class="table-wrapper"><table>')
                   .replace(/<\/table>/g, '</table></div>');
    }

    copyCode(button) {
        const pre = button.closest('.docs-content pre, pre');
        const code = pre?.querySelector('code')?.textContent;

        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                button.classList.add('copied');
                button.querySelector('span').textContent = '已复制';

                setTimeout(() => {
                    button.classList.remove('copied');
                    button.querySelector('span').textContent = '复制';
                }, 2000);
            });
        }
    }

    // ==================== 面包屑 ====================
    updateBreadcrumb(path) {
        const container = document.getElementById('breadcrumb');
        if (!container) return;

        const doc = this.docList.find(d => d.path === path);

        container.innerHTML = '<a href="#!README.md" class="hover:text-gray-900 dark:hover:text-gray-100 transition">文档</a>' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>' +
            '</svg>' +
            '<span class="text-gray-900 dark:text-gray-100">' + (doc?.name || path) + '</span>';
    }

    // ==================== 文档导航 ====================
    updatePagination(path) {
        const container = document.getElementById('doc-pagination');
        if (!container) return;

        const currentIndex = this.docList.findIndex(d => d.path === path);
        const prev = currentIndex > 0 ? this.docList[currentIndex - 1] : null;
        const next = currentIndex < this.docList.length - 1 ? this.docList[currentIndex + 1] : null;

        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">';

        if (prev) {
            html += '<a href="#!' + prev.path + '" class="doc-nav-link">' +
                '<span class="label">← 上一篇</span>' +
                '<span class="title">' + (prev.icon || '📄') + ' ' + prev.name + '</span>' +
            '</a>';
        } else {
            html += '<div></div>';
        }

        if (next) {
            html += '<a href="#!' + next.path + '" class="doc-nav-link sm:text-right">' +
                '<span class="label">下一篇 →</span>' +
                '<span class="title">' + (next.icon || '📄') + ' ' + next.name + '</span>' +
            '</a>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    // ==================== 目录 (TOC) ====================
    updateTOC() {
        const container = document.getElementById('toc-list');
        if (!container) return;

        const headings = document.querySelectorAll('#doc-content h2, #doc-content h3, #doc-content h4');

        if (headings.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">本页无目录</p>';
            return;
        }

        let html = '';
        headings.forEach((heading, index) => {
            const id = 'heading-' + index;
            heading.id = id;
            const level = heading.tagName.toLowerCase();
            html += '<a href="#' + id + '" class="toc-' + level + '">' + heading.textContent + '</a>';
        });

        container.innerHTML = html;
    }

    // ==================== 搜索 ====================
    initSearch() {
        const trigger = document.getElementById('search-trigger');
        const mobileTrigger = document.getElementById('mobile-search-btn');
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');

        const openSearch = () => {
            modal?.classList.remove('hidden');
            input?.focus();
        };

        trigger?.addEventListener('click', openSearch);
        mobileTrigger?.addEventListener('click', openSearch);

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });

        let debounceTimer;
        input?.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 2) {
                this.showSearchEmpty();
                return;
            }

            debounceTimer = setTimeout(() => {
                const searchResults = this.search(query);
                this.renderSearchResults(searchResults, query);
            }, 200);
        });

        input?.addEventListener('keydown', (e) => {
            const items = results?.querySelectorAll('.search-result-item') || [];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedSearchIndex = Math.min(this.selectedSearchIndex + 1, items.length - 1);
                this.updateSearchSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, 0);
                this.updateSearchSelection(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = items[this.selectedSearchIndex];
                if (selected) {
                    window.location.hash = selected.getAttribute('href').substring(1);
                    this.closeSearch();
                }
            }
        });
    }

    async buildSearchIndex() {
        this.searchIndex = [];

        for (const doc of this.docList) {
            try {
                const response = await fetch('../docs/' + doc.path);
                if (response.ok) {
                    const content = await response.text();
                    this.searchIndex.push({
                        ...doc,
                        content: content.toLowerCase(),
                        title: this.extractTitle(content)
                    });
                }
            } catch (e) {
                console.warn('无法索引: ' + doc.path);
            }
        }
    }

    extractTitle(markdown) {
        const match = markdown.match(/^#\s+(.+)$/m);
        return match ? match[1] : '';
    }

    search(query) {
        const q = query.toLowerCase();
        return this.searchIndex.filter(doc => {
            return doc.name.toLowerCase().includes(q) ||
                   doc.title.toLowerCase().includes(q) ||
                   doc.content.includes(q);
        }).slice(0, 10);
    }

    renderSearchResults(results, query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        this.selectedSearchIndex = 0;

        if (results.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500 dark:text-gray-400">' +
                '<p>未找到 "<span class="font-medium">' + query + '</span>" 相关文档</p>' +
            '</div>';
            return;
        }

        let html = '';
        results.forEach((doc, index) => {
            const selected = index === 0 ? ' selected' : '';
            html += '<a href="#!' + doc.path + '" class="search-result-item' + selected + '" onclick="docsViewer.closeSearch()">' +
                '<div class="search-result-title">' + (doc.icon || '📄') + ' ' + doc.name + '</div>' +
                '<div class="search-result-path">' + doc.section + ' / ' + doc.path + '</div>' +
            '</a>';
        });

        container.innerHTML = html;
    }

    updateSearchSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSearchIndex);
        });
        items[this.selectedSearchIndex]?.scrollIntoView({ block: 'nearest' });
    }

    showSearchEmpty() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500 dark:text-gray-400">' +
                '<svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>' +
                '</svg>' +
                '<p>输入关键词开始搜索</p>' +
            '</div>';
        }
    }

    closeSearch() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-input');
        modal?.classList.add('hidden');
        if (input) input.value = '';
        this.showSearchEmpty();
    }

    // ==================== 移动端菜单 ====================
    initMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        btn?.addEventListener('click', () => this.toggleSidebar());
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar?.classList.toggle('-translate-x-full');
        overlay?.classList.toggle('hidden');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
    }

    // ==================== 滚动监听 ====================
    initScrollListener() {
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop?.classList.remove('opacity-0', 'invisible');
            } else {
                backToTop?.classList.add('opacity-0', 'invisible');
            }
            this.updateTOCHighlight();
        });
    }

    updateTOCHighlight() {
        const headings = document.querySelectorAll('#doc-content h2, #doc-content h3, #doc-content h4');
        const tocLinks = document.querySelectorAll('#toc-list a');

        let activeId = '';

        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
                activeId = heading.id;
            }
        });

        tocLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + activeId);
        });
    }

    // ==================== UI 辅助 ====================
    showLoading() {
        const container = document.getElementById('doc-content');
        if (container) {
            container.innerHTML = '<div class="flex flex-col items-center justify-center py-20">' +
                '<div class="relative">' +
                    '<div class="w-12 h-12 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>' +
                    '<div class="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>' +
                '</div>' +
                '<p class="mt-4 text-gray-500 dark:text-gray-400">加载文档中...</p>' +
            '</div>';
        }
    }

    showError(message) {
        const container = document.getElementById('doc-content');
        if (container) {
            container.innerHTML = '<div class="flex flex-col items-center justify-center py-20">' +
                '<div class="text-6xl mb-4">😕</div>' +
                '<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">文档加载失败</h2>' +
                '<p class="text-gray-500 dark:text-gray-400 mb-6">' + message + '</p>' +
                '<button onclick="location.reload()" class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition">重新加载</button>' +
            '</div>';
        }
    }
}

// ==================== 全局函数 ====================
function closeSearch() {
    docsViewer?.closeSearch();
}

function closeSidebar() {
    docsViewer?.closeSidebar();
}

// ==================== 初始化 ====================
let docsViewer;

document.addEventListener('DOMContentLoaded', () => {
    docsViewer = new DocsViewer();
});
