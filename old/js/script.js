document.addEventListener('DOMContentLoaded', () => {

    // --- Common Initializations ---
    const cursor = document.querySelector('.cursor');
    const nav = document.querySelector('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    const loadingScreen = document.getElementById('loading');
    const canvas = document.getElementById('gradient-canvas');

    // --- Loading Screen ---
    window.onload = () => {
        loadingScreen.classList.add('hidden');
    };
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);

    // --- WebGL Background ---
    const gl = canvas ? canvas.getContext('webgl') : null;
    if (gl && canvas) {
        const vertexShaderSource = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
        const fragmentShaderSource = document.getElementById('ink-shader').textContent;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        function createProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program link error: ' + gl.getProgramInfoLog(program));
                return null;
            }
            return program;
        }
        
        const program = createProgram(gl, vertexShader, fragmentShader);
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        const timeUniformLocation = gl.getUniformLocation(program, "u_time");
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        function render(time) {
            time *= 0.001;
            const displayWidth = gl.canvas.clientWidth;
            const displayHeight = gl.canvas.clientHeight;
            if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
                gl.canvas.width = displayWidth;
                gl.canvas.height = displayHeight;
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }
            gl.useProgram(program);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(timeUniformLocation, time);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    } else {
        // 如果是 projects 頁面，就不顯示錯誤
        if (window.location.pathname.includes('projects.html')) {
            console.log('Projects page: using custom grayscale canvas instead of WebGL');
        } else {
            console.warn('WebGL canvas not found on this page');
        }
    }

    // --- Back to Top ---
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Navigation & Scroll Effects ---
    window.addEventListener('scroll', () => {
        // Navigation style
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }
        
        // Scroll hint fade
        const scrollHint = document.querySelector('.scroll-hint');
        if (scrollHint) {
            scrollHint.style.opacity = 1 - Math.min(window.scrollY / 200, 1);
        }
        
        // Scroll progress indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            scrollIndicator.style.width = scrollPercent + '%';
        }
       
        // Back to top button visibility
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });

    // --- Mobile Menu ---
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // ==================== Works Section Interactions ====================
    // Filter functionality
    function initWorksFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const workCards = document.querySelectorAll('.work-card');

        if (filterBtns.length === 0 || workCards.length === 0) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                // Filter cards
                workCards.forEach((card, index) => {
                    const category = card.dataset.category;
                    
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

    // 3D Tilt Effect for work cards
    function initWorkCardTilt() {
        const workCards = document.querySelectorAll('.work-card');

        workCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // Parallax effect for featured work
    function initFeaturedWorkParallax() {
        const featuredMedia = document.querySelector('.featured-media');
        if (!featuredMedia) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rect = featuredMedia.getBoundingClientRect();
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const parallax = (scrolled - featuredMedia.offsetTop) * 0.3;
                const img = featuredMedia.querySelector('img');
                if (img) {
                    img.style.transform = `translateY(${parallax}px) scale(1.1)`;
                }
            }
        });
    }

    // Initialize all works interactions
    function initWorksSection() {
        initWorksFilter();
        initWorkCardTilt();
        initFeaturedWorkParallax();
    }

    // Call initialization
    initWorksSection();

});