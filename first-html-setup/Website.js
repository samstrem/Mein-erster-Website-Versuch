const contactForm = document.getElementById('contact_form');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Wir verhindern das Neuladen

    const formData = new FormData(contactForm);

    // Wir schicken die Daten "heimlich" im Hintergrund an Formspree
    fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            alert("Message sent successfully. Samuel will get back to you shortly.");
            contactForm.reset();
        } else {
            alert("An error occurred. Please try again later or contact me directly via email.");
        }
    }).catch(error => {
        alert("Connection failed. Please try again.");
    });
});

window.onscroll = function() {
    const nav = document.querySelector('.navbar');
    if (window.pageYOffset > 50) {
        nav.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
        nav.style.height = "60px";
    } else {
        nav.style.boxShadow = "none";
        nav.style.height = "70px";
    }
};