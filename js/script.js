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

    // --- Custom Cursor ---
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button, .skill-tag, .work-card, .link-btn, .timeline-content, .back-to-top').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // --- WebGL Background ---
    const gl = canvas.getContext('webgl');
    if (gl) {
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
        console.error("WebGL is not supported.");
    }

    // --- Navigation & Scroll Effects ---
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        
        // Page specific scroll effects
        const scrollHint = document.querySelector('.scroll-hint');
        if (scrollHint) scrollHint.style.opacity = 1 - Math.min(window.scrollY / 200, 1);
        
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
             const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
             scrollIndicator.style.width = scrollPercent + '%';
        }
       
        const backToTopButton = document.querySelector('.back-to-top');
        if(backToTopButton){
            if (window.scrollY > window.innerHeight) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
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

    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // For index.html (Project filtering)
    const worksSidebar = document.querySelector('.works-sidebar');
    if (worksSidebar) {
        const sidebarButtons = document.querySelectorAll('.sidebar-filter-btn');
        const workCards = document.querySelectorAll('.work-card');
        sidebarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                sidebarButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                workCards.forEach((card, index) => {
                    const category = card.dataset.category;
                    const shouldShow = (filter === 'all' || category === filter);
                    if (shouldShow) {
                        card.classList.remove('is-hidden');
                        card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });
    }
    
    

});