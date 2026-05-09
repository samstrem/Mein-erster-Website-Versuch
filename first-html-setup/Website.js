const contactForm = document.getElementById('contact_form');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = new FormData(contactForm);


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