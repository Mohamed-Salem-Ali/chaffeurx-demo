// Chauffeur application form
const chauffeurForm = document.getElementById("chauffeur-form");
const formMsg = document.getElementById("form-message");

if (chauffeurForm) {
  chauffeurForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formMsg.textContent = "✅ Application submitted successfully!";
    formMsg.style.color = "green";
    chauffeurForm.reset();
  });
}

// Contact form
const contactForm = document.getElementById("contact-form");
const contactMsg = document.getElementById("contact-message");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    contactMsg.textContent = "📩 Your message has been sent!";
    contactMsg.style.color = "green";
    contactForm.reset();
  });
}
