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
            alert("Erfolg! Deine Nachricht wurde an Samuel gesendet.");
            contactForm.reset();
        } else {
            alert("Hoppla! Da gab es ein Problem beim Senden.");
        }
    }).catch(error => {
        alert("Fehler: Verbindung zum Server fehlgeschlagen.");
    });
});