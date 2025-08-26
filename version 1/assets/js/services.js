// Load services from JSON
async function loadServices() {
  const container = document.getElementById("services-list");
  try {
    const res = await fetch("assets/data/services.json");
    const data = await res.json();

    container.innerHTML = data.map(service => `
      <div class="card">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <p><strong>Price:</strong> ${service.price}</p>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>⚠️ Failed to load services.</p>";
  }
}
loadServices();

// Price estimator
const form = document.getElementById("estimator-form");
const result = document.getElementById("estimator-result");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const distance = parseFloat(document.getElementById("distance").value);
    const type = document.getElementById("service-type").value;
    let rate = 0;

    switch (type) {
      case "airport": rate = 2; break;
      case "hourly": rate = 20; break;
      case "intercity": rate = 1.5; break;
      case "corporate": rate = 2.5; break;
    }

    const price = distance * rate;
    result.textContent = `Estimated Price: $${price.toFixed(2)}`;
  });
}
