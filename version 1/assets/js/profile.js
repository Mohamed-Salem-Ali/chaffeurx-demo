// Tabs
const tabs = document.querySelectorAll(".tab");
const panels = {
  profile: document.getElementById("tab-profile"),
  preferences: document.getElementById("tab-preferences"),
  notifications: document.getElementById("tab-notifications")
};
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  Object.values(panels).forEach(p => p.classList.add("hidden"));
  panels[t.dataset.tab].classList.remove("hidden");
}));

// Auth state
function getAuth() {
  return JSON.parse(localStorage.getItem("auth") || sessionStorage.getItem("auth") || "null");
}
const auth = getAuth();
if (!auth) {
  // Not logged in → suggest login
  const toast = document.getElementById("profile-toast");
  toast.textContent = "You are not logged in. Some features are disabled.";
  toast.classList.add("show");
}

// Seed profile values
const pf = {
  name: document.getElementById("pf-name"),
  email: document.getElementById("pf-email"),
  phone: document.getElementById("pf-phone"),
  pickup: document.getElementById("pf-pickup"),
};
const savedProfile = JSON.parse(localStorage.getItem("profile") || "null") || {};
pf.name.value = savedProfile.name || auth?.user?.name || "";
pf.email.value = savedProfile.email || auth?.user?.email || "";
pf.phone.value = savedProfile.phone || "";
pf.pickup.value = savedProfile.pickup || "";

// Save profile
document.getElementById("profile-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = { name: pf.name.value, email: pf.email.value, phone: pf.phone.value, pickup: pf.pickup.value };
  localStorage.setItem("profile", JSON.stringify(data));
  const toast = document.getElementById("profile-toast");
  toast.textContent = "Profile saved!";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
});

// Preferences
document.getElementById("pref-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const theme = document.getElementById("pref-theme").value;
  const lang = document.getElementById("pref-lang").value;
  localStorage.setItem("preferences", JSON.stringify({ theme, lang }));
  // Apply theme
  window.__applyTheme?.(theme);
  const toast = document.getElementById("profile-toast");
  toast.textContent = "Preferences saved!";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
});

// Notifications
document.getElementById("notif-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("nt-email").checked;
  const sms = document.getElementById("nt-sms").checked;
  const push = document.getElementById("nt-push").checked;
  localStorage.setItem("notifications", JSON.stringify({ email, sms, push }));
  const toast = document.getElementById("profile-toast");
  toast.textContent = "Notification settings saved!";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
});

// Bookings list
function renderBookings() {
  const list = document.getElementById("bookings-list");
  const history = JSON.parse(localStorage.getItem("bookings") || "[]").slice().reverse();
  if (!history.length) { list.innerHTML = "<p class='muted'>No bookings yet.</p>"; return; }
  list.innerHTML = history.map(b => `
    <div class="list-item">
      <div><strong>${b.number}</strong> • ${b.ride?.pickup} → ${b.ride?.dropoff}</div>
      <div>$${b.total} • ${new Date(b.createdAt).toLocaleString()}</div>
    </div>
  `).join("");
}
renderBookings();
