const toast = document.getElementById("auth-toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Toggle password visibility
function wireToggle(idBtn, idInput) {
  const btn = document.getElementById(idBtn);
  const input = document.getElementById(idInput);
  btn?.addEventListener("click", () => {
    const type = input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);
    btn.textContent = type === "password" ? "Show" : "Hide";
  });
}
wireToggle("toggle-login-pass", "login-pass");
wireToggle("toggle-su-pass", "su-pass");

// Mocked login
document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const role = document.getElementById("login-role").value;
  const remember = document.getElementById("remember").checked;

  // fake token
  const token = "jwt_" + Math.random().toString(36).slice(2);
  const user = { email, role };
  if (remember) localStorage.setItem("auth", JSON.stringify({ token, user }));
  else sessionStorage.setItem("auth", JSON.stringify({ token, user }));

  showToast("Logged in! Redirecting…");
  setTimeout(() => { window.location.href = "profile.html"; }, 900);
});

// Mocked signup
document.getElementById("signup-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("su-name").value;
  const email = document.getElementById("su-email").value;
  const role = document.getElementById("su-role").value;
  // Pretend account is created, then log in
  const token = "jwt_" + Math.random().toString(36).slice(2);
  const user = { name, email, role };
  localStorage.setItem("auth", JSON.stringify({ token, user }));
  showToast("Account created! Redirecting…");
  setTimeout(() => { window.location.href = "profile.html"; }, 900);
});
