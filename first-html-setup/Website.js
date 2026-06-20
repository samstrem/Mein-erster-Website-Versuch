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
