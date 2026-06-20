// Hero entrance animations
var heroAnims = [
    { sel: '.navbar',       delay: 0,   dir: 'up'    },
    { sel: '.hero-photo',   delay: 100, dir: 'right' },
    { sel: '.hero-eyebrow', delay: 200, dir: 'up'    },
    { sel: '.hero-name',    delay: 350, dir: 'up'    },
    { sel: '.hero-divider', delay: 520, dir: 'up'    },
    { sel: '.hero-desc',    delay: 580, dir: 'up'    },
    { sel: '.hero-actions', delay: 700, dir: 'up'    },
];

heroAnims.forEach(function (item) {
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

// Custom toast — replaces browser alert()
function showToast(message, type) {
    let toast = document.getElementById('ss-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ss-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');

    void toast.offsetWidth; // reflow so transition fires every time
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
        toast.classList.remove('show');
    }, 4500);
}

// Navbar scroll state
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Contact form handling
const contactForm = document.getElementById('contact_form');

if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const cleanData = new URLSearchParams();
        const maxChars = 5000;
        let containsFile = false;

        for (const [key, value] of formData.entries()) {
            if (value instanceof File && value.name !== '') {
                containsFile = true;
                break;
            }
            cleanData.append(key, value);
        }

        if (containsFile) {
            showToast('Dateianhänge sind nicht erlaubt.', 'error');
            return;
        }

        if (cleanData.toString().length > maxChars) {
            showToast('Deine Nachricht ist zu lang. Bitte fass dich etwas kürzer.', 'error');
            return;
        }

        fetch(contactForm.action, {
            method: 'POST',
            body: cleanData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            if (response.ok) {
                showToast('Nachricht gesendet. Samuel meldet sich in Kürze.');
                contactForm.reset();
            } else {
                showToast('Ein Fehler ist aufgetreten. Bitte versuche es erneut.', 'error');
            }
        }).catch(function () {
            showToast('Verbindung fehlgeschlagen. Bitte versuche es erneut.', 'error');
        });
    });
}
