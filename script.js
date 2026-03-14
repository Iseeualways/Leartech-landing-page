// ── Sticky nav shadow ──
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ── Lead form submit ──
document.getElementById('leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="bi bi-check-circle"></i> &nbsp; We\'ll be in touch soon!';
    btn.style.background = '#2d6a4f';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = 'Start My Journey &nbsp; <i class="bi bi-arrow-right"></i>';
        btn.style.background = '';
        btn.disabled = false;
        this.reset();
    }, 4000);
});

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const collapse = document.getElementById('navMenu');
            if (collapse.classList.contains('show')) {
                bootstrap.Collapse.getInstance(collapse)?.hide();
            }
        }
    });
});

// ── College cards carousel ──
(function () {
    const track = document.getElementById('track');
    const outer = document.getElementById('trackOuter');
    const prev = document.getElementById('btnPrev');
    const next = document.getElementById('btnNext');
    const dotsEl = document.getElementById('dots');
    const cards = Array.from(track.children);
    let cur = 0, timer = null, drag = false, dragX = 0, dragD = 0;

    function visible() {
        const w = outer.offsetWidth;
        if (w >= 700) return 4;
        if (w >= 540) return 2;
        return 1;
    }
    function cardW() { return cards[0].offsetWidth + 22; }
    function maxIdx() { return Math.max(0, cards.length - visible()); }

    function goTo(i, anim = true) {
        cur = Math.max(0, Math.min(i, maxIdx()));
        if (!anim) track.style.transition = 'none';
        track.style.transform = `translateX(-${cur * cardW()}px)`;
        if (!anim) requestAnimationFrame(() => track.style.transition = '');
        updateDots();
    }
    function goNext() { goTo(cur < maxIdx() ? cur + 1 : 0); }
    function goPrev() { goTo(cur > 0 ? cur - 1 : maxIdx()); }

    function buildDots() {
        dotsEl.innerHTML = '';
        for (let i = 0; i <= maxIdx(); i++) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => { goTo(i); reset(); });
            dotsEl.appendChild(d);
        }
    }
    function updateDots() {
        dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    function start() { timer = setInterval(goNext, 3000); }
    function stop() { clearInterval(timer); }
    function reset() { stop(); start(); }

    outer.addEventListener('mouseenter', stop);
    outer.addEventListener('mouseleave', start);
    next.addEventListener('click', () => { goNext(); reset(); });
    prev.addEventListener('click', () => { goPrev(); reset(); });

    function ds(x) { drag = true; dragX = x; dragD = 0; stop(); }
    function dm(x) { if (drag) dragD = x - dragX; }
    function de() { if (!drag) return; drag = false; if (dragD < -50) goNext(); else if (dragD > 50) goPrev(); start(); }

    outer.addEventListener('mousedown', e => ds(e.clientX));
    window.addEventListener('mousemove', e => { if (drag) dm(e.clientX); });
    window.addEventListener('mouseup', de);
    outer.addEventListener('touchstart', e => ds(e.touches[0].clientX), { passive: true });
    outer.addEventListener('touchmove', e => { if (drag) dm(e.touches[0].clientX); }, { passive: true });
    outer.addEventListener('touchend', de);

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { buildDots(); goTo(Math.min(cur, maxIdx()), false); }, 180);
    });

    buildDots();
    goTo(0, false);
    start();
})();

// ── Testimonials carousel ──
(function () {
    const track = document.getElementById('tcTrack');
    const cards = track.querySelectorAll('.tc-card');
    const dots = document.querySelectorAll('.tc-dot');
    const fill = document.getElementById('tcFill');
    const total = cards.length;
    const INTERVAL = 6000;
    let cur = 0, elapsed = 0, lastTs = null, paused = false;

    function getOffset() {
        return cur * (cards[0].offsetWidth + 16);
    }

    function goTo(n) {
        cur = (n + total) % total;
        track.style.transform = `translateX(-${getOffset()}px)`;
        cards.forEach((c, i) => c.classList.toggle('active', i === cur));
        dots.forEach((d, i) => d.classList.toggle('active', i === cur));
        elapsed = 0; lastTs = null;
        fill.style.width = '0%';
    }

    document.getElementById('tcPrev').addEventListener('click', () => goTo(cur - 1));
    document.getElementById('tcNext').addEventListener('click', () => goTo(cur + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; paused = true; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 44) goTo(dx < 0 ? cur + 1 : cur - 1);
        paused = false; lastTs = null;
    });

    function tick(ts) {
        if (!paused) {
            if (!lastTs) lastTs = ts;
            elapsed += ts - lastTs;
            fill.style.width = Math.min((elapsed / INTERVAL) * 100, 100) + '%';
            if (elapsed >= INTERVAL) goTo(cur + 1);
        }
        lastTs = paused ? null : ts;
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
        track.style.transition = 'none';
        track.style.transform = `translateX(-${getOffset()}px)`;
        requestAnimationFrame(() => track.style.transition = '');
    });
})();

let cur = 0;
const cards = [...document.querySelectorAll('.scard')];
const dots = [...document.querySelectorAll('.ndot')];
function go(n) {
    cur = (n + 3) % 3;
    cards.forEach((c, i) => { 
        const p = (i - cur + 3) % 3; 
        c.dataset.pos = p > 2 ? 2 : p; 
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
}
cards.forEach(c => c.onclick = () => { if (+c.dataset.pos > 0) go(+c.dataset.i); });
setInterval(() => go(cur + 1), 4000);