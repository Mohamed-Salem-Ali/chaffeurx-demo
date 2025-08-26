// Accordion logic
document.querySelectorAll(".accordion-header").forEach((btn) => {
  btn.addEventListener("click", () => {
    const body = btn.nextElementSibling;
    body.style.display = body.style.display === "block" ? "none" : "block";
  });
});
