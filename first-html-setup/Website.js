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
            alert('Dateianhänge sind nicht erlaubt. Bitte nur Text eingeben.');
            return;
        }

        if (cleanData.toString().length > maxChars) {
            alert('Deine Nachricht ist zu lang. Bitte fass dich etwas kürzer.');
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
                alert('Message sent successfully. Samuel will get back to you shortly.');
                contactForm.reset();
            } else {
                alert('An error occurred. Please try again later.');
            }
        }).catch(function () {
            alert('Connection failed. Please try again.');
        });
    });
}
