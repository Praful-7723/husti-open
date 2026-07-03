/* ============================================================
   HUSTI Landing Page — Enhanced Script
   ============================================================ */

// ⚡ IMPORTANT: Update this URL to your deployed HUSTI app
const HUSTI_APP_URL = './app/';

// ─── PWA Install Prompt ───
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// ─── Platform Detection ───
function getPlatform() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
}

// ─── Install Modal ───
function showInstallModal() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
        return;
    }

    const overlay = document.getElementById('install-overlay');
    const content = document.getElementById('install-content');
    const appLink = document.getElementById('install-open-app');
    appLink.href = HUSTI_APP_URL;

    const platform = getPlatform();
    let html = '';

    if (platform === 'ios') {
        html = `<div class="install-steps">
            <div class="install-step"><span class="install-step-num">1</span><p>Open the HUSTI app link below in <strong>Safari</strong> (not Chrome)</p></div>
            <div class="install-step"><span class="install-step-num">2</span><p>Tap the <strong>Share</strong> button <strong style="font-size:1.2em">↑</strong> at the bottom</p></div>
            <div class="install-step"><span class="install-step-num">3</span><p>Scroll down and tap <strong>"Add to Home Screen"</strong></p></div>
            <div class="install-step"><span class="install-step-num">4</span><p>Tap <strong>"Add"</strong> — HUSTI is now on your home screen!</p></div>
        </div>`;
    } else if (platform === 'android') {
        html = `<div class="install-steps">
            <div class="install-step"><span class="install-step-num">1</span><p>Open the HUSTI app link below in <strong>Chrome</strong></p></div>
            <div class="install-step"><span class="install-step-num">2</span><p>Tap the <strong>install banner</strong>, or tap <strong>⋮ → "Add to Home Screen"</strong></p></div>
            <div class="install-step"><span class="install-step-num">3</span><p>HUSTI appears on your home screen as a <strong>native app</strong>!</p></div>
        </div>`;
    } else {
        html = `<div class="install-steps">
            <div class="install-step"><span class="install-step-num">1</span><p>Open the HUSTI app link below in <strong>Chrome</strong> or <strong>Edge</strong></p></div>
            <div class="install-step"><span class="install-step-num">2</span><p>Click the <strong>install icon ⊕</strong> in the address bar (right side)</p></div>
            <div class="install-step"><span class="install-step-num">3</span><p>Click <strong>"Install"</strong> — HUSTI opens as a <strong>desktop app</strong>!</p></div>
        </div>`;
    }

    content.innerHTML = html;
    overlay.classList.add('active');
}

function closeInstallModal() {
    document.getElementById('install-overlay').classList.remove('active');
}

// ─── Scroll Progress Bar ───
function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
}

// ─── Scroll Reveal (Intersection Observer) with Stagger ───
function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Apply stagger class if inside a grid/list container
                const parent = entry.target.closest('.cards-row, .features-grid, .steps-list, .compare-grid');
                if (parent) {
                    const siblings = Array.from(parent.querySelectorAll('.reveal'));
                    const idx = siblings.indexOf(entry.target);
                    entry.target.classList.add('stagger-' + Math.min(idx + 1, 8));
                }
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ─── Hero Parallax on Mouse ───
function setupHeroParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const shapes = hero.querySelectorAll('.shape');
    const phone = hero.querySelector('.phone-frame');

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        shapes.forEach((shape, i) => {
            const speed = (i + 1) * 12;
            shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });

        if (phone) {
            phone.style.transform = `rotateY(${x * -8 - 5}deg) rotateX(${y * 8 + 2}deg)`;
        }
    });

    hero.addEventListener('mouseleave', () => {
        shapes.forEach((shape) => {
            shape.style.transform = '';
            shape.style.transition = 'transform 0.6s ease';
            setTimeout(() => { shape.style.transition = ''; }, 600);
        });
        if (phone) {
            phone.style.transform = '';
        }
    });
}

// ─── Parallax Shapes on Scroll ───
function setupScrollParallax() {
    const shapes = document.querySelectorAll('.hero-shapes .shape');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        shapes.forEach((shape, i) => {
            const speed = 0.15 + i * 0.08;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }, { passive: true });
}

// ─── Nav Scroll Effect ───
function setupNavScroll() {
    const nav = document.getElementById('nav');
    const check = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', check, { passive: true });
    check();
}

// ─── Mobile Nav Toggle ───
function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// ─── Smooth Scroll ───
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const y = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

// ─── Phone Mockup Calendar ───
function populateMockCalendar() {
    const grid = document.getElementById('mock-calendar');
    if (!grid) return;

    const startDay = 2; // July 2025 starts on Tuesday
    const totalDays = 31;
    const savedDays = new Set([1,2,3,5,6,7,8,10,11,12,14,15,17,18,19,20,21,23,24,25,27,28,30]);

    let html = '';
    for (let i = 0; i < startDay; i++) {
        html += '<div class="mock-day empty"></div>';
    }
    for (let d = 1; d <= totalDays; d++) {
        const cls = savedDays.has(d) ? 'mock-day saved' : 'mock-day';
        html += `<div class="${cls}">${d}</div>`;
    }
    grid.innerHTML = html;

    // Animate calendar cells appearing one by one
    const cells = grid.querySelectorAll('.mock-day:not(.empty)');
    cells.forEach((cell, i) => {
        cell.style.opacity = '0';
        cell.style.transform = 'scale(0.5)';
        setTimeout(() => {
            cell.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
        }, 800 + i * 40); // Start after hero loads, stagger 40ms
    });
}

// ─── Counter Animation ───
function animateCounter(element, target, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(start + (target - start) * eased);
        element.textContent = '₹' + current.toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function setupCounters() {
    const statValues = document.querySelectorAll('.mock-stat-value');
    if (statValues.length >= 1) {
        setTimeout(() => animateCounter(statValues[0], 12450, 2000), 1200);
    }
}

// ─── Download Buttons ───
function setupDownloadButtons() {
    document.querySelectorAll('.download-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showInstallModal();
        });
    });

    const closeBtn = document.getElementById('install-close');
    if (closeBtn) closeBtn.addEventListener('click', closeInstallModal);

    const overlay = document.getElementById('install-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeInstallModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeInstallModal();
    });
}

// ─── Card 3D Tilt Effect ───
function setupCardTilt() {
    document.querySelectorAll('.card, .feature').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translate(-4px, -4px) perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ─── Comparison Interactive Toggle ───
function setupComparisonToggle() {
    const checkbox = document.getElementById('check');
    const label = document.getElementById('toggle-label');
    if (!checkbox || !label) return;

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            label.innerHTML = 'HUSTI Mode: <span style="color: var(--accent-lime)">Activated</span>';
        } else {
            label.innerHTML = 'HUSTI Mode: <span style="color: #ff3b6c">Deactivated</span>';
        }
    });
}

// ─── Phone Mockup 3D Tilt Effect ───
function setupPhoneTilt() {
    const phone = document.querySelector('.phone-frame');
    if (!phone) return;

    phone.addEventListener('mousemove', (e) => {
        const rect = phone.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        phone.style.animationPlayState = 'paused';
        phone.style.transform = `perspective(1000px) scale(1.03) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });

    phone.addEventListener('mouseleave', () => {
        phone.style.animationPlayState = 'running';
        phone.style.transform = '';
    });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    setupScrollProgress();
    setupReveal();
    setupNavScroll();
    setupMobileNav();
    setupSmoothScroll();
    populateMockCalendar();
    setupDownloadButtons();
    setupHeroParallax();
    setupScrollParallax();
    setupCounters();
    setupCardTilt();
    setupComparisonToggle();
    setupPhoneTilt();
});
