const contactForm = document.getElementById('contact_form');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = new FormData(contactForm);
    const cleanData = new URLSearchParams(); // Wir nutzen URLSearchParams für reinen Text
    
    let containsFile = false;
    const maxChars = 5000; // Sicherheitslimit für den gesamten Text

    // Daten prüfen
    for (const [key, value] of formData.entries()) {
        // 1. Check: Ist es eine Datei (Blob)?
        if (value instanceof File && value.name !== "") {
            containsFile = true;
            break;
        }
        
        // 2. Check: Ist es Text? Dann hinzufügen
        cleanData.append(key, value);
    }

    if (containsFile) {
        alert("Dateianhänge sind nicht erlaubt. Bitte nur Text eingeben.");
        return; // Abbruch
    }

    if (cleanData.toString().length > maxChars) {
        alert("Deine Nachricht ist zu lang. Bitte fass dich etwas kürzer.");
        return; // Abbruch
    }

    // Absenden der bereinigten Daten
    fetch(contactForm.action, {
        method: 'POST',
        body: cleanData, // Wir senden jetzt cleanData statt formData
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
    }).then(response => {
        if (response.ok) {
            alert("Message sent successfully. Samuel will get back to you shortly.");
            contactForm.reset();
        } else {
            alert("An error occurred. Please try again later.");
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