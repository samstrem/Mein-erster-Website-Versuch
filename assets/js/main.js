// Hero entrance animations
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var heroAnims = [
    { sel: '.navbar',       delay: 0,   dir: 'up'    },
    { sel: '.hero-photo',   delay: 100, dir: 'right' },
    { sel: '.hero-eyebrow', delay: 200, dir: 'up'    },
    { sel: '.hero-name',    delay: 320, dir: 'up'    },
    { sel: '.hero-role',    delay: 460, dir: 'up'    },
    { sel: '.hero-desc',    delay: 560, dir: 'up'    },
    { sel: '.hero-actions', delay: 660, dir: 'up'    },
    { sel: '.hero-facts',   delay: 780, dir: 'up'    },
    { sel: '.page-head',    delay: 100, dir: 'up'    },
];

if (!reduceMotion) heroAnims.forEach(function (item) {
    var el = document.querySelector(item.sel);
    if (!el) return;

    el.classList.add('anim-hidden');
    if (item.dir === 'up')    el.classList.add('anim-hidden-up');
    if (item.dir === 'right') el.classList.add('anim-hidden-right');

    // double rAF ensures the browser commits the hidden state before transitioning
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            el.classList.add('anim-transition');
            setTimeout(function () {
                el.classList.remove('anim-hidden', 'anim-hidden-up', 'anim-hidden-right');
            }, item.delay);
        });
    });
});

// Scroll reveal for cards and CV sections
var revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
} else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
}

// Active nav link
var currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href').split('#')[0];
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
    }
});

// Navbar scroll state
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
