// Navigation Component
const navHTML = `
    <nav>
        <ul class="nav-links">
            <li><a href="/index.html#home" data-page="home">Home</a></li>
            <li><a href="/projects.html" data-page="works">Projects</a></li>
            <li><a href="/index.html#about" data-page="about">About</a></li>
            <li><a href="/presentations.html" data-page="presentations">Presentations</a></li>
        </ul>
        <a href="index.html" class="nav-logo">KL</a>
        <ul class="nav-socials">
            <li><a href="https://www.instagram.com/karenlu3.works/" target="_blank">Instagram</a></li>
            <li><a href="https://www.behance.net/karenlu5" target="_blank">Behance</a></li>
            <li><a href="https://www.linkedin.com/in/karen-lu-2a6922261/" target="_blank">LinkedIn</a></li>
        </ul>
        <div class="menu-toggle"><span></span><span></span><span></span></div>
    </nav>

    <div class="nav-mobile-menu">
        <ul class="nav-links">
            <li><a href="/index.html#home">Home</a></li>
            <li><a href="/projects.html">Projects</a></li>
            <li><a href="/index.html#about">About</a></li>
            <li><a href="/presentations.html">Presentations</a></li>
        </ul>
        <ul class="nav-socials">
            <li><a href="https://www.instagram.com/karenlu3.works/" target="_blank">IG</a></li>
            <li><a href="https://www.behance.net/karenlu5" target="_blank">BE</a></li>
            <li><a href="https://www.linkedin.com/in/karen-lu-2a6922261/" target="_blank">IN</a></li>
        </ul>
    </div>
`;

// Footer Component
const footerHTML = `
    <footer>
        <div class="copyright">© 2020 - 2025 karenlu3.works</div>
    </footer>

    <a href="#" class="back-to-top" aria-label="Back to top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M11.9999 10.8284L7.05016 15.7782L5.63595 14.364L11.9999 8L18.3639 14.364L16.9497 15.7782L11.9999 10.8284Z"></path>
        </svg>
    </a>
`;

// Ink Shader Component
const inkShaderHTML = `
    <script id="ink-shader" type="x-shader/x-fragment">
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise (vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm (vec2 st) {
    float value = 0.0; float amplitude = .5;
    for (int i = 0; i < 4; i++) { value += amplitude * noise(st); st *= 2.; amplitude *= .5; }
    return value;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    float time = u_time * 0.1;
    vec2 q = vec2(fbm(uv + vec2(0.0,0.0)), fbm(uv + vec2(5.2,1.3)));
    vec2 r = vec2(fbm(uv + 4.0*q + vec2(1.7,9.2) + 0.15*time), fbm(uv + 4.0*q + vec2(8.3,2.8) + 0.126*time));
    float f = fbm(uv + r);
    vec3 color = mix(vec3(0.05, 0.05, 0.1), vec3(0.1, 0.1, 0.2), smoothstep(0.2, 0.5, f));
    color = mix(color, vec3(0.8, 0.8, 0.9), smoothstep(0.4, 0.6, f));
    float vignette = 1.0 - length(gl_FragCoord.xy / u_resolution.xy - 0.5) * 0.7;
    gl_FragColor = vec4(color * vignette, 1.0);
}
    <\/script>
`;

// Load components
function loadComponents() {
    // Insert navigation at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // Insert footer and shader before component.js script tag
    const componentScript = document.querySelector('script[src*="component.js"]');
    if (componentScript) {
        componentScript.insertAdjacentHTML('beforebegin', footerHTML);
        componentScript.insertAdjacentHTML('beforebegin', inkShaderHTML);
    }
    
    // Set active state for navigation
    setActiveNav();
}

// Set active navigation item based on current page
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    
    document.querySelectorAll('nav .nav-links a').forEach(link => {
        link.classList.remove('active');
        
        if (currentPage.includes('presentations.html') && link.getAttribute('data-page') === 'presentations') {
            link.classList.add('active');
        } else if (currentPage.includes('index.html') || currentPage === '') {
            if (currentHash && link.getAttribute('href').includes(currentHash)) {
                link.classList.add('active');
            } else if (!currentHash && link.getAttribute('data-page') === 'home') {
                link.classList.add('active');
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}