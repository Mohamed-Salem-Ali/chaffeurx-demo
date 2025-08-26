// Simple state store in sessionStorage
const store = {
  set(key, value) { sessionStorage.setItem(key, JSON.stringify(value)); },
  get(key, def = null) {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? def; } catch { return def; }
  }
};

// Steps handling
const steps = Array.from(document.querySelectorAll(".wizard-step"));
const progress = Array.from(document.querySelectorAll(".steps .step"));

function goto(stepNum) {
  steps.forEach(s => s.classList.toggle("hidden", s.dataset.step !== String(stepNum)));
  progress.forEach(p => p.classList.toggle("active", p.dataset.step === String(stepNum)));
}

function validateStep1() {
  const requiredIds = ["pickup", "dropoff", "date", "time", "passengers", "luggage"];
  const missing = requiredIds.filter(id => !document.getElementById(id).value);
  return missing.length === 0;
}

function renderVehicles() {
  const container = document.getElementById("vehicles");
  container.innerHTML = "";
  const vehicles = [
    { id: "sedan", name: "Executive Sedan", capacity: 3, price: 45, features: ["Wi-Fi", "Water"] },
    { id: "suv", name: "Luxury SUV", capacity: 5, price: 70, features: ["Wi-Fi", "Child Seat"] },
    { id: "van", name: "Business Van", capacity: 7, price: 85, features: ["Wi-Fi", "Luggage"] }
  ];

  vehicles.forEach(v => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card selectable";
    card.setAttribute("aria-pressed", "false");
    card.innerHTML = `
      <h3>${v.name}</h3>
      <p>Capacity: ${v.capacity}</p>
      <p>Estimated Price: $${v.price}</p>
      <p class="muted">${v.features.join(" • ")}</p>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(".selectable").forEach(el => el.classList.remove("selected"));
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
      store.set("vehicle", v);
      document.getElementById("choose-vehicle").disabled = false;
    });
    container.appendChild(card);
  });
}

function computeSummary() {
  const ride = store.get("ride");
  const vehicle = store.get("vehicle");
  const base = vehicle.price;
  let total = base;
  const promo = (store.get("promo") || "").toUpperCase();
  if (promo === "SAVE10") total = +(total * 0.9).toFixed(2);

  return { ride, vehicle, base, promo, total };
}

// Wiring buttons
document.querySelectorAll("[data-next]").forEach(btn => btn.addEventListener("click", () => {
  const current = document.querySelector(".wizard-step:not(.hidden)");
  const step = +current.dataset.step;

  if (step === 1) {
    if (!validateStep1()) { alert("Please fill all required fields."); return; }
    const ride = {
      pickup: pickup.value, dropoff: dropoff.value, date: date.value, time: time.value,
      passengers: +passengers.value, luggage: +luggage.value, service: service.value
    };
    store.set("ride", ride);
    renderVehicles();
  }

  if (step === 2 && !store.get("vehicle")) { alert("Please select a vehicle."); return; }

  if (step === 3) {
    const ok = document.getElementById("agree-pp").checked &&
               document.getElementById("agree-tou").checked &&
               document.getElementById("agree-cp").checked;
    if (!ok) { alert("Please accept PP, ToU and Cancellation Policy."); return; }
  }

  goto(step + 1);

  if (step + 1 === 3) {
    const s = computeSummary();
    document.getElementById("summary").innerHTML = `
      <h3>Review</h3>
      <p><strong>From:</strong> ${s.ride.pickup} → <strong>To:</strong> ${s.ride.dropoff}</p>
      <p><strong>Date:</strong> ${s.ride.date} ${s.ride.time} • <strong>Service:</strong> ${s.ride.service}</p>
      <p><strong>Vehicle:</strong> ${s.vehicle.name} • <strong>Base:</strong> $${s.base}</p>
      <p><strong>Total:</strong> $${s.total}</p>
    `;
  }

  if (step + 1 === 4) {
    // Confirmation
    const number = "CX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    document.getElementById("confirm-number").textContent = `Booking #${number}`;
    // Save to profile history
    const history = JSON.parse(localStorage.getItem("bookings") || "[]");
    history.push({ number, ...computeSummary(), createdAt: new Date().toISOString() });
    localStorage.setItem("bookings", JSON.stringify(history));
    // Fake "real-time" ticker
    const ticker = document.getElementById("status-ticker");
    const msgs = ["Driver assigned", "Vehicle en-route", "Arriving shortly", "Arrived"];
    let i = 0;
    ticker.textContent = "Processing…";
    const interval = setInterval(() => {
      ticker.textContent = msgs[i++];
      if (i >= msgs.length) clearInterval(interval);
    }, 2000);
  }
}));

document.querySelectorAll("[data-back]").forEach(btn => btn.addEventListener("click", () => {
  const current = document.querySelector(".wizard-step:not(.hidden)");
  const step = +current.dataset.step;
  goto(step - 1);
}));

// Promo logic
document.getElementById("apply-promo")?.addEventListener("click", () => {
  const code = document.getElementById("promo").value.trim();
  store.set("promo", code);
  const s = computeSummary();
  document.getElementById("summary").innerHTML += `<p class="muted">Promo applied: ${s.promo || "—"}</p>
  <p><strong>New Total:</strong> $${s.total}</p>`;
});

// Enable confirm when policies checked
["agree-pp","agree-tou","agree-cp"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", () => {
    const ok = document.getElementById("agree-pp").checked &&
               document.getElementById("agree-tou").checked &&
               document.getElementById("agree-cp").checked;
    document.getElementById("confirm-btn").disabled = !ok;
  });
});

document.getElementById("confirm-btn")?.addEventListener("click", () => {
  goto(4);
});

// Init
goto(1);
